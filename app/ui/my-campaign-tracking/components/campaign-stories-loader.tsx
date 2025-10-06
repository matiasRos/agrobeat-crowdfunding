import { Suspense } from 'react';
import Image from 'next/image';
import { auth } from '@/app/auth';
import { getCampaignStories } from '@/app/lib/services/stories';
import { CampaignStoriesClient } from './campaign-stories-client';
import { StoriesLoadingSkeleton } from './my-campaign-story-skeleton';

interface CampaignStoriesLoaderProps {
  campaignId: number;
  campaignTitle: string;
  iconUrl: string;
  imageUrl: string;
}

async function StoriesContent({ campaignId, campaignTitle, iconUrl, imageUrl }: CampaignStoriesLoaderProps) {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : undefined;

  // Obtener stories de la campaña
  const stories = await getCampaignStories(campaignId, userId);
  
  // Si no hay stories, solo mostrar el ícono sin interacción
  if (stories.length === 0) {
    return (
      <div className="relative w-20 h-20 overflow-hidden rounded-full bg-muted p-4">
        <Image
          src={iconUrl}
          alt={campaignTitle}
          className="h-full w-full object-cover"
          width={80}
          height={80}
        />
      </div>
    );
  }

  // Mapear los stories de la BD
  const storiesData = stories.map(story => ({
    id: story.id,
    url: story.mediaUrl,
    type: story.mediaType,
    alt: story.caption || `Story de ${campaignTitle}`,
    isViewed: story.isViewed,
    description: story.description,
  }));

  // Calcular el índice del primer story no visto (sin query adicional)
  const initialIndex = storiesData.findIndex(story => !story.isViewed);
  // Si todos fueron vistos, empezar desde el principio
  const startIndex = initialIndex === -1 ? 0 : initialIndex;

  return (
    <CampaignStoriesClient
      stories={storiesData}
      initialIndex={startIndex}
      campaignTitle={campaignTitle}
      iconUrl={iconUrl}
    />
  );
}

export function CampaignStoriesLoader(props: CampaignStoriesLoaderProps) {
  return (
    <Suspense fallback={<StoriesLoadingSkeleton iconUrl={props.iconUrl} campaignTitle={props.campaignTitle} />}>
      <StoriesContent {...props} />
    </Suspense>
  );
}

