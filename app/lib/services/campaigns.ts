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
    // Campos para simulador de inversión
    costPerPlant: campaign.costPerPlant, // Decimal comes as string from DB
    plantsPerM2: campaign.plantsPerM2,
    minPlants: campaign.minPlants,
    maxPlants: campaign.maxPlants,
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
   * @param userId - ID del usuario para marcar campañas en las que ya invirtió
   */
  static async getAllCampaigns(userId?: number): Promise<CampaignResponse[]> {
    try {
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
        .where(eq(campaigns.isActive, true))
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

      // Si hay usuario, obtener sus inversiones para marcar las campañas
      let userInvestmentIds = new Set<number>();
      if (userId) {
        const userInvestments = await db
          .select({ campaignId: investments.campaignId })
          .from(investments)
          .where(eq(investments.userId, userId));
        
        userInvestmentIds = new Set(userInvestments.map(inv => inv.campaignId));
      }

      // Mapear los resultados
      return campaignsWithProducers.map(row => {
        const stats = statsMap.get(row.campaign.id) || { raisedAmount: '0.00', investorCount: 0 };
        const isInvestedByUser = userInvestmentIds.has(row.campaign.id);
        return mapCampaignToResponse(row.campaign, row.producer, stats, row.timeline, isInvestedByUser);
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
        .where(eq(campaigns.id, id))
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
        .where(eq(investments.userId, userId));

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
}
 
// Funciones auxiliares exportadas
export const getUserInvestments = CampaignService.getUserInvestments;