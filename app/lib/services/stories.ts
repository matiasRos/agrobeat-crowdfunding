import { db } from '@/app/lib/db';
import { campaignStories, storyViews } from '@/app/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export interface CampaignStoryWithView {
  id: number;
  campaignId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string | null;
  description: string | null;
  displayOrder: number;
  isViewed: boolean;
  createdAt: Date;
}

/**
 * Obtiene todos los stories de una campaña con información de si el usuario los vio
 * @param campaignId - ID de la campaña
 * @param userId - ID del usuario (opcional, si no se proporciona todos aparecen como no vistos)
 * @returns Array de stories ordenados por displayOrder
 */
export async function getCampaignStories(
  campaignId: number,
  userId?: number
): Promise<CampaignStoryWithView[]> {
  try {
    // Obtener solo los stories activos de la campaña
    const stories = await db
      .select({
        id: campaignStories.id,
        campaignId: campaignStories.campaignId,
        mediaUrl: campaignStories.mediaUrl,
        mediaType: campaignStories.mediaType,
        caption: campaignStories.caption,
        description: campaignStories.description,
        displayOrder: campaignStories.displayOrder,
        createdAt: campaignStories.createdAt,
      })
      .from(campaignStories)
      .where(
        and(
          eq(campaignStories.campaignId, campaignId),
          eq(campaignStories.isActive, true) // Solo stories activos
        )
      )
      .orderBy(asc(campaignStories.displayOrder));

    // Si no hay usuario, retornar todos como no vistos
    if (!userId) {
      return stories.map((story) => ({
        ...story,
        mediaType: story.mediaType as 'image' | 'video',
        isViewed: false,
      }));
    }

    // Obtener las visualizaciones del usuario para esta campaña
    const userViews = await db
      .select({
        storyId: storyViews.storyId,
      })
      .from(storyViews)
      .where(eq(storyViews.userId, userId));

    const viewedStoryIds = new Set(userViews.map((v) => v.storyId));

    // Combinar stories con información de visualización
    return stories.map((story) => ({
      ...story,
      mediaType: story.mediaType as 'image' | 'video',
      isViewed: viewedStoryIds.has(story.id),
    }));
  } catch (error) {
    console.error('Error al obtener stories de la campaña:', error);
    throw new Error('No se pudieron obtener los stories de la campaña');
  }
}

/**
 * Marca un story como visto por un usuario
 * @param storyId - ID del story
 * @param userId - ID del usuario
 */
export async function markStoryAsViewed(
  storyId: number,
  userId: number
): Promise<void> {
  try {
    // Insertar visualización (ignora si ya existe por la constraint UNIQUE)
    await db
      .insert(storyViews)
      .values({
        storyId,
        userId,
      })
      .onConflictDoNothing(); // Si ya existe, no hace nada
  } catch (error) {
    console.error('Error al marcar story como visto:', error);
    // No lanzamos error para que no afecte la experiencia del usuario
  }
}

/**
 * Obtiene el índice del primer story no visto de una campaña
 * @param campaignId - ID de la campaña
 * @param userId - ID del usuario
 * @returns Índice del primer story no visto, o 0 si todos fueron vistos o no hay usuario
 */
export async function getFirstUnviewedStoryIndex(
  campaignId: number,
  userId?: number
): Promise<number> {
  if (!userId) return 0;

  try {
    const stories = await getCampaignStories(campaignId, userId);
    const firstUnviewedIndex = stories.findIndex((story) => !story.isViewed);
    
    // Si todos fueron vistos, empezar desde el principio
    return firstUnviewedIndex === -1 ? 0 : firstUnviewedIndex;
  } catch (error) {
    console.error('Error al obtener índice de primer story no visto:', error);
    return 0;
  }
}

/**
 * Crea un nuevo story para una campaña (útil para admin)
 * @param data - Datos del story
 */
export async function createCampaignStory(data: {
  campaignId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}): Promise<void> {
  try {
    await db.insert(campaignStories).values({
      campaignId: data.campaignId,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      caption: data.caption || null,
      description: data.description || null,
      displayOrder: data.displayOrder || 0,
      isActive: data.isActive ?? true,
    });
  } catch (error) {
    console.error('Error al crear story:', error);
    throw new Error('No se pudo crear el story');
  }
}

/**
 * Activa o desactiva un story
 * @param storyId - ID del story
 * @param isActive - true para activar, false para desactivar
 */
export async function toggleStoryActive(
  storyId: number,
  isActive: boolean
): Promise<void> {
  try {
    await db
      .update(campaignStories)
      .set({ 
        isActive,
        updatedAt: new Date()
      })
      .where(eq(campaignStories.id, storyId));
  } catch (error) {
    console.error('Error al cambiar estado del story:', error);
    throw new Error('No se pudo cambiar el estado del story');
  }
}

