'use server';

import { auth } from '@/app/auth';
import { markStoryAsViewed } from '@/app/lib/services/stories';

/**
 * Action para marcar un story como visto
 * @param storyId - ID del story que se visualizó
 */
export async function markStoryViewedAction(storyId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Verificar autenticación
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Usuario no autenticado',
      };
    }

    // Marcar el story como visto
    await markStoryAsViewed(storyId, Number(session.user.id));

    return { success: true };
  } catch (error) {
    console.error('Error al marcar story como visto:', error);
    return {
      success: false,
      error: 'Error al marcar el story como visto',
    };
  }
}

