import Image from 'next/image';

export function StoriesLoadingSkeleton({ iconUrl, campaignTitle }: { iconUrl: string; campaignTitle: string }) {
    return (
      <div className="relative w-20 h-20">
        {/* Imagen de fondo */}
        <div className="relative w-20 h-20 overflow-hidden rounded-full bg-muted p-4">
          <Image
            src={iconUrl}
            alt={campaignTitle}
            className="h-full w-full object-cover"
            width={80}
            height={80}
          />
        </div>
        {/* Aro de loading animado */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white/70 animate-spin" />
      </div>
    );
  }
  