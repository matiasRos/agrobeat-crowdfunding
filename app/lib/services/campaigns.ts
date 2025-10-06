import { db } from '@/app/lib/db';
import { campaigns, producers, investments, users, campaignTimeline, NewCampaign, NewProducer } from '@/app/lib/db/schema';
import { eq, sql, count, asc, notExists, and } from 'drizzle-orm';
import { CampaignResponse } from '@/app/types/campaign';

// Helper function to map DB campaign to API response format
const mapCampaignToResponse = (campaign: any, producer: any, investmentStats: any, timeline?: any, isInvestedByUser?: boolean): CampaignResponse => {
  // Calcular días restantes dinámicamente
  const closingDate = new Date(campaign.closingDate);
  const today = new Date();
  const diffTime = closingDate.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    crop: campaign.crop,
    location: campaign.location,
    targetAmount: campaign.targetAmount, // Decimal comes as string from DB
    raisedAmount: investmentStats.raisedAmount || '0.00',
    investorCount: investmentStats.investorCount || 0,
    closingDate: campaign.closingDate.toISOString(), // Fecha específica
    daysLeft: daysLeft, // Calculado dinámicamente
    expectedReturn: campaign.expectedReturn, // Decimal comes as string from DB
    riskLevel: campaign.riskLevel,
    imageUrl: campaign.imageUrl,
    iconUrl: campaign.iconUrl,
    mapsLink: campaign.mapsLink,
    isActive: campaign.isActive,
    // Campos para simulador de inversión
    costPerPlant: campaign.costPerPlant, // Decimal comes as string from DB
    plantsPerM2: campaign.plantsPerM2,
    minPlants: campaign.minPlants,
    maxPlants: campaign.maxPlants,
    marketPrice: campaign.marketPrice, // Decimal comes as string from DB
    producer: {
      name: producer.name,
      experience: producer.experience,
    },
    timeline: timeline ? {
      title: timeline.title,
      events: timeline.events || []
    } : undefined,
    isInvestedByUser: isInvestedByUser || false,
  };
};

export class CampaignService {
  /**
   * Obtiene todas las campañas activas con sus estadísticas de inversión
   * @param userId - ID del usuario para excluir campañas en las que ya invirtió
   */
  static async getAllCampaigns(userId?: number): Promise<CampaignResponse[]> {
    try {
      // Construir la condición WHERE base
      const whereConditions = [eq(campaigns.isActive, true)];
      
      // Si hay userId, excluir campañas en las que el usuario ya invirtió
      if (userId) {
        whereConditions.push(
          notExists(
            db.select()
              .from(investments)
              .where(
                and(
                  eq(investments.campaignId, campaigns.id),
                  eq(investments.userId, userId)
                )
              )
          )
        );
      }

      // Obtener campañas con sus productores y cronograma
      const campaignsWithProducers = await db
        .select({
          campaign: campaigns,
          producer: producers,
          timeline: campaignTimeline,
        })
        .from(campaigns)
        .leftJoin(producers, eq(campaigns.producerId, producers.id))
        .leftJoin(campaignTimeline, eq(campaigns.id, campaignTimeline.campaignId))
        .where(and(...whereConditions))
        .orderBy(asc(campaigns.id));

      // Obtener estadísticas de inversión para cada campaña
      const campaignIds = campaignsWithProducers.map(row => row.campaign.id);
      
      const investmentStats = await db
        .select({
          campaignId: investments.campaignId,
          raisedAmount: sql<string>`COALESCE(SUM(${investments.amount}), 0)::text`,
          investorCount: count(sql`DISTINCT ${investments.userId}`),
        })
        .from(investments)
        .where(sql`${investments.campaignId} IN (${sql.join(campaignIds, sql`, `)})`)
        .groupBy(investments.campaignId);

      // Crear un mapa de estadísticas por campaignId
      const statsMap = new Map();
      investmentStats.forEach(stat => {
        statsMap.set(stat.campaignId, {
          raisedAmount: stat.raisedAmount,
          investorCount: stat.investorCount,
        });
      });

      // Mapear los resultados (todas las campañas ya están filtradas, ninguna está invertida por el usuario)
      return campaignsWithProducers.map(row => {
        const stats = statsMap.get(row.campaign.id) || { raisedAmount: '0.00', investorCount: 0 };
        return mapCampaignToResponse(row.campaign, row.producer, stats, row.timeline, false);
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }
  }

  /**
   * Obtiene una campaña por ID con sus estadísticas
   */
  static async getCampaignById(id: number): Promise<CampaignResponse | null> {
    try {
      // Obtener campaña con productor y cronograma
      const result = await db
        .select({
          campaign: campaigns,
          producer: producers,
          timeline: campaignTimeline,
        })
        .from(campaigns)
        .leftJoin(producers, eq(campaigns.producerId, producers.id))
        .leftJoin(campaignTimeline, eq(campaigns.id, campaignTimeline.campaignId))
        .where(and(eq(campaigns.id, id), eq(campaigns.isActive, true)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      // Obtener estadísticas de inversión
        const [investmentStats] = await db
          .select({
            raisedAmount: sql<string>`COALESCE(SUM(${investments.amount}), 0)::text`,
            investorCount: count(sql`DISTINCT ${investments.userId}`),
          })
          .from(investments)
          .where(eq(investments.campaignId, id));

      const stats = investmentStats || { raisedAmount: '0.00', investorCount: 0 };
      return mapCampaignToResponse(result[0].campaign, result[0].producer, stats, result[0].timeline);
    } catch (error) {
      console.error(`Error fetching campaign with id ${id}:`, error);
      throw new Error(`Failed to fetch campaign with id ${id}`);
    }
  }

  /**
   * Crea una nueva campaña con su productor
   */
  static async createCampaign(
    campaignData: Omit<NewCampaign, 'id' | 'createdAt' | 'updatedAt' | 'producerId'>, 
    producerData: Omit<NewProducer, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CampaignResponse> {
    try {
      const result = await db.transaction(async (tx) => {
        // Insertar o buscar productor por email
        let producer;
        if (producerData.email) {
          const existingProducer = await tx
            .select()
            .from(producers)
            .where(eq(producers.email, producerData.email))
            .limit(1);
          
          if (existingProducer.length > 0) {
            producer = existingProducer[0];
          }
        }

        if (!producer) {
          const [newProducer] = await tx.insert(producers).values(producerData).returning();
          producer = newProducer;
        }

        // Insertar campaña
        const [newCampaign] = await tx.insert(campaigns).values({
          ...campaignData,
          producerId: producer.id,
        }).returning();

        return mapCampaignToResponse(newCampaign, producer, { raisedAmount: '0.00', investorCount: 0 });
      });
      
      return result;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  /**
   * Actualiza una campaña
   */
  static async updateCampaign(
    id: number, 
    campaignData: Partial<Omit<NewCampaign, 'id' | 'producerId' | 'createdAt'>>,
    producerData?: Partial<Omit<NewProducer, 'id' | 'createdAt'>>
  ): Promise<CampaignResponse | null> {
    try {
      const result = await db.transaction(async (tx) => {
        // Actualizar campaña
        const [updatedCampaign] = await tx.update(campaigns)
          .set({ ...campaignData, updatedAt: new Date() })
          .where(eq(campaigns.id, id))
          .returning();

        if (!updatedCampaign) {
          return null;
        }

        // Obtener/actualizar productor
        const producerResult = await tx.select().from(producers).where(eq(producers.id, updatedCampaign.producerId)).limit(1);
        let producer = producerResult[0];

        if (producerData && producer) {
          const [updatedProducer] = await tx.update(producers)
            .set({ ...producerData, updatedAt: new Date() })
            .where(eq(producers.id, producer.id))
            .returning();
          producer = updatedProducer;
        }

        if (!producer) {
          throw new Error('Producer not found for campaign');
        }

        // Obtener estadísticas actualizadas
        const [investmentStats] = await tx
          .select({
            raisedAmount: sql<string>`COALESCE(SUM(${investments.amount}), 0)::text`,
            investorCount: count(sql`DISTINCT ${investments.userId}`),
          })
          .from(investments)
          .where(eq(investments.campaignId, id));

        const stats = investmentStats || { raisedAmount: '0.00', investorCount: 0 };
        return mapCampaignToResponse(updatedCampaign, producer, stats);
      });
      
      return result;
    } catch (error) {
      console.error(`Error updating campaign with id ${id}:`, error);
      throw new Error(`Failed to update campaign with id ${id}`);
    }
  }

  /**
   * Elimina (desactiva) una campaña
   */
  static async deleteCampaign(id: number): Promise<boolean> {
    try {
      const [deletedCampaign] = await db.update(campaigns)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(campaigns.id, id))
        .returning({ id: campaigns.id });

      return !!deletedCampaign;
    } catch (error) {
      console.error(`Error deleting campaign with id ${id}:`, error);
      throw new Error(`Failed to delete campaign with id ${id}`);
    }
  }

  /**
   * Obtiene las inversiones de un usuario con información de las campañas
   */
  static async getUserInvestments(userId: number): Promise<Array<{
    id: number;
    amount: string;
    plantCount: number;
    isPaid: boolean;
    createdAt: Date;
    campaign: CampaignResponse;
  }> | null> {
    try {
      // Verificar que el usuario existe
      const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userResult.length === 0) {
        return null;
      }

      // Obtener inversiones del usuario con información de campañas
      const userInvestments = await db
        .select({
          investment: investments,
          campaign: campaigns,
          producer: producers,
          timeline: campaignTimeline,
        })
        .from(investments)
        .leftJoin(campaigns, eq(investments.campaignId, campaigns.id))
        .leftJoin(producers, eq(campaigns.producerId, producers.id))
        .leftJoin(campaignTimeline, eq(campaigns.id, campaignTimeline.campaignId))
        .where(and(eq(investments.userId, userId), eq(campaigns.isActive, true)));

      if (userInvestments.length === 0) {
        return [];
      }

      // Obtener estadísticas de inversión para cada campaña
      const campaignIds = Array.from(new Set(userInvestments.map(row => row.campaign?.id).filter((id): id is number => id !== undefined)));
      
      const investmentStats = await db
        .select({
          campaignId: investments.campaignId,
          raisedAmount: sql<string>`COALESCE(SUM(${investments.amount}), 0)::text`,
          investorCount: count(sql`DISTINCT ${investments.userId}`),
        })
        .from(investments)
        .where(sql`${investments.campaignId} IN (${sql.join(campaignIds, sql`, `)})`)
        .groupBy(investments.campaignId);

      // Crear un mapa de estadísticas por campaignId
      const statsMap = new Map();
      investmentStats.forEach(stat => {
        statsMap.set(stat.campaignId, {
          raisedAmount: stat.raisedAmount,
          investorCount: stat.investorCount,
        });
      });

      // Mapear los resultados
      return userInvestments
        .map(row => {
          if (!row.campaign || !row.producer) {
            return null;
          }

          const stats = statsMap.get(row.campaign.id) || { raisedAmount: '0.00', investorCount: 0 };
          const campaignResponse = mapCampaignToResponse(row.campaign, row.producer, stats, row.timeline);

          return {
            id: row.investment.id,
            amount: row.investment.amount,
            plantCount: row.investment.plantCount,
            isPaid: row.investment.isPaid || false,
            createdAt: row.investment.investedAt,
            campaign: campaignResponse,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (error) {
      console.error(`Error fetching user investments for user ID ${userId}:`, error);
      throw new Error(`Failed to fetch user investments for user ID ${userId}`);
    }
  }

  /**
   * Simula una inversión en una campaña
   */
  static async investInCampaign(
    campaignId: number, 
    userId: number,
    amount: number,
    plantCount: number
  ): Promise<CampaignResponse> {
    try {
      const result = await db.transaction(async (tx) => {
        // Verificar que el usuario existe
        const userResult = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userResult.length === 0) {
          throw new Error('User not found');
        }

        // Verificar que la campaña existe y está activa
        const campaignCheck = await tx.select().from(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.isActive, true))).limit(1);
        if (campaignCheck.length === 0) {
          throw new Error('Campaign not found or inactive');
        }

        // Crear inversión
        await tx.insert(investments).values({
          campaignId,
          userId: userId,
          amount: amount.toString(),
          plantCount,
        });

        // Obtener campaña actualizada con estadísticas
        const campaignResult = await tx
          .select({
            campaign: campaigns,
            producer: producers,
          })
          .from(campaigns)
          .leftJoin(producers, eq(campaigns.producerId, producers.id))
          .where(eq(campaigns.id, campaignId))
          .limit(1);

        if (campaignResult.length === 0) {
          throw new Error('Campaign not found');
        }

        // Obtener estadísticas actualizadas
        const [investmentStats] = await tx
          .select({
            raisedAmount: sql<string>`COALESCE(SUM(${investments.amount}), 0)::text`,
            investorCount: count(sql`DISTINCT ${investments.userId}`),
          })
          .from(investments)
          .where(eq(investments.campaignId, campaignId));

        const stats = investmentStats || { raisedAmount: '0.00', investorCount: 0 };
        return mapCampaignToResponse(campaignResult[0].campaign, campaignResult[0].producer, stats);
      });
      
      return result;
    } catch (error) {
      console.error(`Error investing in campaign ${campaignId}:`, error);
      throw new Error(`Failed to invest in campaign ${campaignId}`);
    }
  }

  /**
   * Actualiza el estado de pago de una inversión
   */
  static async updateInvestmentPaymentStatus(
    investmentId: number, 
    isPaid: boolean
  ): Promise<boolean> {
    try {
      const [updatedInvestment] = await db.update(investments)
        .set({ isPaid })
        .where(eq(investments.id, investmentId))
        .returning({ id: investments.id });

      return !!updatedInvestment;
    } catch (error) {
      console.error(`Error updating payment status for investment ${investmentId}:`, error);
      throw new Error(`Failed to update payment status for investment ${investmentId}`);
    }
  }

  /**
   * Obtiene todos los inversores con sus datos relevantes (con paginación)
   */
  static async getAllInvestors(options?: {
    page?: number;
    pageSize?: number;
  }): Promise<{
    investors: Array<{
      id: number;
      email: string;
      name: string | null;
      amount: string;
      plantCount: number;
      isPaid: boolean;
      campaignTitle: string;
      investedAt: Date;
    }>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const offset = (page - 1) * pageSize;

      // Obtener el conteo total de inversores
      const [countResult] = await db
        .select({
          count: count(),
        })
        .from(investments)
        .leftJoin(users, eq(investments.userId, users.id))
        .leftJoin(campaigns, eq(investments.campaignId, campaigns.id))
        .where(eq(campaigns.isActive, true));

      const totalCount = countResult?.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Obtener inversores paginados
      const investorsList = await db
        .select({
          investment: investments,
          user: users,
          campaign: campaigns,
        })
        .from(investments)
        .leftJoin(users, eq(investments.userId, users.id))
        .leftJoin(campaigns, eq(investments.campaignId, campaigns.id))
        .where(eq(campaigns.isActive, true))
        .orderBy(sql`${investments.investedAt} DESC`)
        .limit(pageSize)
        .offset(offset);

      const investors = investorsList
        .map(row => {
          if (!row.user || !row.campaign) {
            return null;
          }

          return {
            id: row.investment.id,
            email: row.user.email,
            name: row.user.name,
            amount: row.investment.amount,
            plantCount: row.investment.plantCount,
            isPaid: row.investment.isPaid || false,
            campaignTitle: row.campaign.title,
            investedAt: row.investment.investedAt,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      return {
        investors,
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error(`Error fetching all investors:`, error);
      throw new Error(`Failed to fetch all investors`);
    }
  }

  /**
   * Obtiene inversiones por estado de pago
   */
  static async getInvestmentsByPaymentStatus(isPaid: boolean): Promise<Array<{
    id: number;
    amount: string;
    plantCount: number;
    isPaid: boolean;
    createdAt: Date;
    user: { name: string | null; email: string };
    campaign: { title: string; id: number };
  }>> {
    try {
      const investmentsList = await db
        .select({
          investment: investments,
          user: users,
          campaign: campaigns,
        })
        .from(investments)
        .leftJoin(users, eq(investments.userId, users.id))
        .leftJoin(campaigns, eq(investments.campaignId, campaigns.id))
        .where(eq(investments.isPaid, isPaid));

      return investmentsList
        .map(row => {
          if (!row.user || !row.campaign) {
            return null;
          }

          return {
            id: row.investment.id,
            amount: row.investment.amount,
            plantCount: row.investment.plantCount,
            isPaid: row.investment.isPaid || false,
            createdAt: row.investment.investedAt,
            user: {
              name: row.user.name,
              email: row.user.email,
            },
            campaign: {
              title: row.campaign.title,
              id: row.campaign.id,
            },
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (error) {
      console.error(`Error fetching investments by payment status:`, error);
      throw new Error(`Failed to fetch investments by payment status`);
    }
  }

  /**
   * Obtiene todas las campañas para administración (activas e inactivas) con paginación
   */
  static async getAllCampaignsAdmin(options?: {
    page?: number;
    pageSize?: number;
  }): Promise<{
    campaigns: Array<{
      id: number;
      title: string;
      crop: string;
      location: string;
      targetAmount: string;
      raisedAmount: string;
      investorCount: number;
      closingDate: Date;
      isActive: boolean;
      producerName: string;
      createdAt: Date;
    }>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const offset = (page - 1) * pageSize;

      // Obtener el conteo total de campañas
      const [countResult] = await db
        .select({
          count: count(),
        })
        .from(campaigns);

      const totalCount = countResult?.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Obtener campañas paginadas con sus productores
      const campaignsList = await db
        .select({
          campaign: campaigns,
          producer: producers,
        })
        .from(campaigns)
        .leftJoin(producers, eq(campaigns.producerId, producers.id))
        .orderBy(sql`${campaigns.createdAt} DESC`)
        .limit(pageSize)
        .offset(offset);

      // Obtener estadísticas de inversión para cada campaña
      const campaignIds = campaignsList.map(row => row.campaign.id);
      
      const investmentStats = campaignIds.length > 0 ? await db
        .select({
          campaignId: investments.campaignId,
          raisedAmount: sql<string>`COALESCE(SUM(${investments.amount}), 0)::text`,
          investorCount: count(sql`DISTINCT ${investments.userId}`),
        })
        .from(investments)
        .where(sql`${investments.campaignId} IN (${sql.join(campaignIds, sql`, `)})`)
        .groupBy(investments.campaignId) : [];

      // Crear un mapa de estadísticas por campaignId
      const statsMap = new Map<number, { raisedAmount: string; investorCount: number }>();
      investmentStats.forEach(stat => {
        statsMap.set(stat.campaignId, {
          raisedAmount: stat.raisedAmount,
          investorCount: stat.investorCount,
        });
      });

      const campaignsData = campaignsList
        .map(row => {
          if (!row.producer) {
            return null;
          }

          const stats = statsMap.get(row.campaign.id) || { raisedAmount: '0', investorCount: 0 };

          return {
            id: row.campaign.id,
            title: row.campaign.title,
            crop: row.campaign.crop,
            location: row.campaign.location,
            targetAmount: row.campaign.targetAmount,
            raisedAmount: stats.raisedAmount,
            investorCount: stats.investorCount,
            closingDate: row.campaign.closingDate,
            isActive: row.campaign.isActive,
            producerName: row.producer.name,
            createdAt: row.campaign.createdAt,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      return {
        campaigns: campaignsData,
        totalCount,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error(`Error fetching all campaigns for admin:`, error);
      throw new Error(`Failed to fetch all campaigns for admin`);
    }
  }

  /**
   * Alterna el estado activo/inactivo de una campaña
   */
  static async toggleCampaignStatus(campaignId: number): Promise<boolean> {
    try {
      // Obtener el estado actual
      const [campaign] = await db
        .select({ isActive: campaigns.isActive })
        .from(campaigns)
        .where(eq(campaigns.id, campaignId))
        .limit(1);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Alternar el estado
      const [updatedCampaign] = await db
        .update(campaigns)
        .set({ 
          isActive: !campaign.isActive,
          updatedAt: new Date() 
        })
        .where(eq(campaigns.id, campaignId))
        .returning({ isActive: campaigns.isActive });

      return updatedCampaign?.isActive || false;
    } catch (error) {
      console.error(`Error toggling campaign status:`, error);
      throw new Error(`Failed to toggle campaign status`);
    }
  }
}
 
// Funciones auxiliares exportadas
export const getUserInvestments = CampaignService.getUserInvestments;