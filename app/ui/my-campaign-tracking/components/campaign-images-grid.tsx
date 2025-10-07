'use client';

import Image from 'next/image';
import { ImageIcon, PlayCircle } from 'lucide-react';
import { useStoriesViewer } from './stories-viewer-context';

export interface Story {
  id: number;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  isViewed: boolean;
  description?: string | null;
}

interface CampaignImagesGridProps {
  stories: Story[];
  campaignTitle: string;
}

export function CampaignImagesGrid({ stories, campaignTitle }: CampaignImagesGridProps) {
  const { openStories } = useStoriesViewer();

  if (stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg border-2 border-dashed border-gray-300">
        <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          No hay imágenes disponibles
        </p>
      </div>
    );
  }

  const handleMediaClick = (storyId: number) => {
    // Encontrar el índice de este story en el array completo
    const index = stories.findIndex(s => s.id === storyId);
    if (index !== -1) {
      openStories(index);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {stories.map((story) => (
        <div
          key={story.id}
          className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer group"
          onClick={() => handleMediaClick(story.id)}
        >
          {story.type === 'image' ? (
            <Image
              src={story.url}
              alt={story.alt || `Imagen de ${campaignTitle}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            />
          ) : (
            <>
              <video
                src={story.url}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                preload="metadata"
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
              </div>
            </>
          )}
          {story.description && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs line-clamp-2">{story.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

