import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp } from "lucide-react";
import { CampaignResponse } from "@/app/types/campaign";
import { getCurrentCampaignStage, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface MyCampaignCardProps {
  campaign: CampaignResponse;
  userInvestment: {
    id: number;
    amount: string;
    plantCount: number;
    createdAt: Date;
  };
}

export function MyCampaignCard({ campaign, userInvestment }: MyCampaignCardProps) {
  const stageInfo = getCurrentCampaignStage(campaign);
  const StageIcon = stageInfo.icon;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {/* Imagen a la izquierda */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 overflow-hidden rounded-lg  p-3 bg-gray-100">
              <Image
                src={campaign.iconUrl || campaign.imageUrl}
                alt={campaign.title}
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            </div>
          </div>

          {/* Contenido a la derecha */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-1">{userInvestment.plantCount} plantas de {campaign.crop}</h3>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <a
                href={campaign.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground  hover:font-semibold"
              >
                <span className="truncate text-sm ">{campaign.location}</span>
              </a>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Etapa Actual */}
        <div className={`rounded-lg p-3 ${stageInfo.colorClasses}`}>
          <div className="flex items-center gap-2 mb-1">
            <StageIcon className="h-4 w-4" />
            <p className="text-xs font-medium">Etapa Actual</p>
          </div>
          <p className="text-sm font-semibold">{stageInfo.stage}</p>
          <p className="text-xs mt-1">{stageInfo.description}</p>
          {stageInfo.daysInfo && (
            <p className="text-xs mt-1 font-medium">{stageInfo.daysInfo}</p>
          )}
        </div>

        {/* Mi Inversión */}
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-green-700 font-medium">Mi Inversión</p>
          <div className="flex justify-between items-center mt-1">
            <div>
              <p className="text-sm font-medium text-green-800">
                {formatCurrency(parseFloat(userInvestment.amount))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600">
                Invertido el {new Date(userInvestment.createdAt).toLocaleDateString('es-PY')}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link href={`/dashboard/my-campaigns/${campaign.id}`}>
            <Button className="w-full" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Hacer seguimiento
            </Button>
          </Link>
        </div>
        {/* Botón de seguimiento */}

      </CardContent>
    </Card>
  );
}
