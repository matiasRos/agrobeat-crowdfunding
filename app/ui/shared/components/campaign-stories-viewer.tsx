'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Story {
  id: number;
  url: string;
  type: 'image' | 'video';
  alt?: string;
  isViewed?: boolean;
  description?: string | null;
}

interface CampaignStoriesViewerProps {
  stories: Story[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  onStoryViewed?: (storyId: number) => void;
}

export function CampaignStoriesViewer({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
  campaignTitle,
  onStoryViewed,
}: CampaignStoriesViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Duración de cada story en milisegundos
  const IMAGE_STORY_DURATION = 5000;
  // Ancho de las áreas de navegación lateral (en porcentaje)
  const NAVIGATION_AREA_WIDTH = 25; // 25% por cada lado
  
  // Obtener la duración actual basada en el tipo de media
  const currentStory = stories[currentIndex];
  const currentDuration = currentStory?.type === 'video' && videoDuration 
    ? videoDuration * 1000 // Convertir segundos a milisegundos
    : IMAGE_STORY_DURATION;

  // Resetear estado cuando se monta el componente
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    
    // Marcar el primer story como visto cuando se abre
    if (onStoryViewed && initialIndex >= 0 && initialIndex < stories.length) {
      onStoryViewed(stories[initialIndex].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta al montar

  // Función helper para cambiar de índice y marcar como visto
  const goToIndex = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < stories.length) {
      setCurrentIndex(newIndex);
      setProgress(0);
      setIsDescriptionExpanded(false); // Resetear expansión al cambiar de story
      setIsMediaLoaded(false); // Resetear estado de carga al cambiar de story
      setVideoDuration(null); // Resetear duración del video al cambiar de story
      onStoryViewed?.(stories[newIndex].id);
    }
  }, [stories, onStoryViewed]);

  // Auto-avance del progreso y cambio automático de story
  useEffect(() => {
    // No iniciar el intervalo si está pausado o si la media no está cargada
    if (isPaused || !isMediaLoaded) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (currentDuration / 100));
        
        if (newProgress >= 100) {
          // Pasar al siguiente story automáticamente
          if (currentIndex < stories.length - 1) {
            // Usar setTimeout para evitar setState durante render
            setTimeout(() => goToIndex(currentIndex + 1), 0);
            return 100;
          } else {
            // Cerrar cuando termina el último story
            setTimeout(() => onClose(), 0);
            return 100;
          }
        }
        return newProgress;
      });
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex, stories.length, onClose, goToIndex, isPaused, isMediaLoaded, currentDuration]);

  // Manejar clics en el contenedor
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    // Calcular los límites de las áreas de navegación
    const leftAreaWidth = (containerWidth * NAVIGATION_AREA_WIDTH) / 100;
    const rightAreaStart = containerWidth - leftAreaWidth;

    // Si hace clic en el área izquierda (25% izquierdo), ir al anterior
    if (clickX < leftAreaWidth) {
      if (currentIndex > 0) {
        goToIndex(currentIndex - 1);
        setIsPaused(false); // Reanudar al cambiar de story
      }
    } 
    // Si hace clic en el área derecha (25% derecho), ir al siguiente
    else if (clickX > rightAreaStart) {
      if (currentIndex < stories.length - 1) {
        goToIndex(currentIndex + 1);
        setIsPaused(false); // Reanudar al cambiar de story
      } else {
        onClose();
      }
    } 
    // Si hace clic en el centro (50% central), pausar/reanudar
    else {
      setIsPaused(prev => !prev);
    }
  }, [currentIndex, stories.length, goToIndex, onClose]);

  // Manejar teclas de navegación
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToIndex(currentIndex - 1);
        setIsPaused(false); // Reanudar al cambiar de story
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < stories.length - 1) {
          goToIndex(currentIndex + 1);
          setIsPaused(false); // Reanudar al cambiar de story
        } else {
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        // Espacio para pausar/reanudar
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, stories.length, onClose, goToIndex]);

  // Evitar scroll del body cuando está montado
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const hasDescription = currentStory.description && currentStory.description.trim().length > 0;
  const descriptionLength = currentStory.description?.length || 0;
  const shouldTruncate = descriptionLength > 150; // Truncar si es mayor a 150 caracteres

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Barras de progreso */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {stories.map((_, index) => (
          <div
            key={index}
            className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
              style={{
                width:
                  index < currentIndex
                    ? '100%'
                    : index === currentIndex
                    ? `${progress}%`
                    : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Controles superiores */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Indicador de pausa - solo visible cuando está pausado */}
        {isPaused && (
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
            <svg 
              className="w-5 h-5 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          </div>
        )}

        {/* Botón cerrar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-8 w-8" />
        </Button>
      </div>

      {/* Contenedor de la story */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
      >
        {currentStory.type === 'image' ? (
          <div className="relative w-full h-full">
            <Image
              src={currentStory.url}
              alt={currentStory.alt || `Story ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              onLoadingComplete={() => setIsMediaLoaded(true)}
              onError={() => setIsMediaLoaded(true)}
            />
            {/* Indicador de carga */}
            {!isMediaLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={currentStory.url}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              onLoadedMetadata={(e) => {
                const video = e.currentTarget;
                setVideoDuration(video.duration);
              }}
              onLoadedData={() => setIsMediaLoaded(true)}
              onEnded={() => {
                if (currentIndex < stories.length - 1) {
                  goToIndex(currentIndex + 1);
                  setIsPaused(false);
                } else {
                  onClose();
                }
              }}
              onPause={() => setIsPaused(true)}
              onPlay={() => setIsPaused(false)}
              onError={() => setIsMediaLoaded(true)}
            />
            {/* Indicador de carga para videos */}
            {!isMediaLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </>
        )}

        {/* Áreas de toque invisibles para navegación (visual feedback) */}
        <div className="absolute inset-0 flex pointer-events-none">
          {/* Área izquierda - 25% */}
          <div className="h-full" style={{ width: `${NAVIGATION_AREA_WIDTH}%` }} />
          {/* Área centro - 50% */}
          <div className="flex-1 h-full" />
          {/* Área derecha - 25% */}
          <div className="h-full" style={{ width: `${NAVIGATION_AREA_WIDTH}%` }} />
        </div>
      </div>

      {/* Descripción de la story - parte inferior con blur */}
      {hasDescription && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-auto">
          <div className="backdrop-blur-xl bg-black/40 p-4 pb-6">
            <div className="max-w-2xl mx-auto">
              <p 
                className={`text-white text-sm leading-relaxed ${
                  !isDescriptionExpanded && shouldTruncate ? 'line-clamp-3' : ''
                }`}
              >
                {currentStory.description}
              </p>
              
              {shouldTruncate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                  className="mt-2 text-white/80 hover:text-white text-xs font-medium underline transition-colors"
                >
                  {isDescriptionExpanded ? 'Ver menos' : 'Leer más'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

