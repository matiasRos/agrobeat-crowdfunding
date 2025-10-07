'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ImageIcon } from 'lucide-react';
import { useStoriesViewer } from './stories-viewer-context';
import type { CarouselApi } from '@/components/ui/carousel';

export interface Story {
  id: number;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  isViewed: boolean;
  description?: string | null;
}

interface CampaignImagesCarouselProps {
  stories: Story[];
  campaignTitle: string;
}

export function CampaignImagesCarousel({ stories, campaignTitle }: CampaignImagesCarouselProps) {
  const { openStories } = useStoriesViewer();
  const [isDragging, setIsDragging] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const diffX = Math.abs(e.clientX - dragStartPos.current.x);
    const diffY = Math.abs(e.clientY - dragStartPos.current.y);
    
    // Si se movió más de 5px, considerarlo drag
    if (diffX > 5 || diffY > 5) {
      setIsDragging(true);
    }
  };

  const handleImageClick = (storyId: number) => {
    // Solo abrir si NO fue un drag
    if (!isDragging) {
      const index = stories.findIndex(s => s.id === storyId);
      if (index !== -1) {
        openStories(index);
      }
    }
  };

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "center",
        loop: false,
        containScroll: "trimSnaps",
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {stories.map((story, index) => (
          <CarouselItem 
            key={story.id} 
            className="pl-2 md:pl-4 basis-[85%] md:basis-[90%]"
          >
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted cursor-pointer group transition-all duration-300"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onClick={() => handleImageClick(story.id)}
            >
              {story.type === 'image' ? (
                <Image
                  src={story.url}
                  alt={story.alt || `Imagen de ${campaignTitle}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <>
                  <video
                    src={story.url}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    preload="metadata"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 rounded-full p-3">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                </>
              )}
              
              {/* Overlay negro para imágenes no activas */}
              {index !== current && (
                <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 pointer-events-none" />
              )}
              
              {story.description && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm line-clamp-2">{story.description}</p>
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}

