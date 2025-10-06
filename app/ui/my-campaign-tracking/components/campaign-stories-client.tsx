'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { CampaignStoriesViewer } from '@/app/ui/shared/components';
import { markStoryViewedAction } from '@/app/actions/mark-story-viewed';

interface Story {
  id: number;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  isViewed: boolean;
  description?: string | null;
}

interface CampaignStoriesClientProps {
  stories: Story[];
  initialIndex: number;
  campaignTitle: string;
  iconUrl: string;
}

export function CampaignStoriesClient({ 
  stories: initialStories, 
  initialIndex: serverInitialIndex,
  campaignTitle,
  iconUrl 
}: CampaignStoriesClientProps) {
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  // Estado local para tracking de vistas (optimistic update)
  const [localStories, setLocalStories] = useState(initialStories);

  // useCallback para función estable que no cause re-renders
  const handleStoryViewed = useCallback((storyId: number) => {
    // No marcar como visto si el ID es 0 (stories por defecto sin DB)
    if (storyId === 0) return;
    
    // Actualización optimista: marcar como visto localmente
    setLocalStories(prev => 
      prev.map(story => 
        story.id === storyId ? { ...story, isViewed: true } : story
      )
    );
    
    // Enviar al servidor en background (sin esperar)
    markStoryViewedAction(storyId);
  }, []);

  const hasUnviewedStories = localStories.some(s => !s.isViewed);
  
  // Calcular el índice inicial basado en el estado actual de localStories
  const currentInitialIndex = (() => {
    const firstUnviewedIndex = localStories.findIndex(s => !s.isViewed);
    // Si todos fueron vistos, empezar desde el principio
    return firstUnviewedIndex === -1 ? 0 : firstUnviewedIndex;
  })();

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsStoriesOpen(true)}
          className="relative w-20 h-20 overflow-hidden rounded-full bg-muted p-4 cursor-pointer hover:opacity-80 transition-opacity ring-4 ring-white/50 hover:ring-white"
          aria-label="Ver galería de imágenes"
        >
          <Image
            src={iconUrl}
            alt={campaignTitle}
            className="h-full w-full object-cover"
            width={80}
            height={80}
          />
        </button>
        
        {/* Indicador de stories no vistos - círculo verde fuera del botón */}
        {hasUnviewedStories && (
          <div className="absolute inset-0 rounded-full ring-[3px] ring-green-500 pointer-events-none" />
        )}
      </div>

      {/* Visor de stories - solo renderizar cuando está abierto */}
      {isStoriesOpen && (
        <CampaignStoriesViewer
          stories={localStories}
          initialIndex={currentInitialIndex}
          isOpen={isStoriesOpen}
          onClose={() => setIsStoriesOpen(false)}
          campaignTitle={campaignTitle}
          onStoryViewed={handleStoryViewed}
        />
      )}
    </>
  );
}

