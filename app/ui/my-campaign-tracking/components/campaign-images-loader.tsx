import { Suspense } from 'react';
import { auth } from '@/app/auth';
import { getCampaignStories } from '@/app/lib/services/stories';
import { CampaignImagesCarousel } from './campaign-images-carousel';
import { CampaignImagesCarouselSkeleton } from './campaign-images-carousel-skeleton';

interface CampaignImagesLoaderProps {
  campaignId: number;
  campaignTitle: string;
}

async function ImagesContent({ campaignId, campaignTitle }: CampaignImagesLoaderProps) {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  // Obtener stories de la campaña
  const stories = await getCampaignStories(campaignId, userId);
  
  // Si no hay stories, no mostrar nada
  if (stories.length === 0) {
    return null;
  }

  // Mapear los stories de la BD
  const storiesData = stories.map(story => ({
    id: story.id,
    url: story.mediaUrl,
    type: story.mediaType as 'image' | 'video',
    alt: story.caption || `Imagen de ${campaignTitle}`,
    isViewed: story.isViewed,
    description: story.description,
  }));

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4">📸 Mira crecer tus plantas en tiempo real</h3>
      <CampaignImagesCarousel stories={storiesData} campaignTitle={campaignTitle} />
    </div>
  );
}

export function CampaignImagesLoader(props: CampaignImagesLoaderProps) {
  return (
    <Suspense fallback={<CampaignImagesCarouselSkeleton />}>
      <ImagesContent {...props} />
    </Suspense>
  );
}

