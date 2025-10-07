import { Skeleton } from '@/components/ui/skeleton';

export function CampaignImagesCarouselSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-64 mb-4" />
      <div className="relative w-full">
        {/* Simular el carousel con imagen principal centrada y laterales visibles */}
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          {/* Imagen anterior (parcialmente visible a la izquierda) */}
          <div className="flex-shrink-0 w-[15%] md:w-[10%] opacity-40">
            <Skeleton className="aspect-[4/3] rounded-lg" />
          </div>
          
          {/* Imagen principal (centrada) */}
          <div className="flex-shrink-0 w-[70%] md:w-[80%]">
            <Skeleton className="aspect-[4/3] rounded-lg" />
          </div>
          
          {/* Imagen siguiente (parcialmente visible a la derecha) */}
          <div className="flex-shrink-0 w-[15%] md:w-[10%] opacity-40">
            <Skeleton className="aspect-[4/3] rounded-lg" />
          </div>
        </div>
        
        {/* Botones de navegación skeleton */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

