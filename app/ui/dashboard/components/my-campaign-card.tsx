import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { CampaignResponse } from "@/app/types/campaign";
import Image from "next/image";

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {/* Imagen a la izquierda */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-20 overflow-hidden rounded-lg">
              <Image
                src={campaign.imageUrl}
                alt={campaign.title}
                className="h-full w-full object-cover"
                width={80}
                height={80}
              />
            </div>
          </div>
          
          {/* Contenido a la derecha */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-1">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {campaign.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{campaign.location}</span>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {campaign.crop}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mi Inversión */}
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-xs text-green-700 font-medium">Mi Inversión</p>
          <div className="flex justify-between items-center mt-1">
            <div>
              <p className="text-sm font-medium text-green-800">
                {formatCurrency(parseFloat(userInvestment.amount))}
              </p>
              <p className="text-xs text-green-600">
                {userInvestment.plantCount} plantas
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-green-600">
                Invertido el {new Date(userInvestment.createdAt).toLocaleDateString('es-PY')}
              </p>
            </div>
          </div>
        </div>

        {/* Productor */}
        <div className="rounded-lg bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Productor</p>
          <p className="text-sm font-medium">{campaign.producer.name}</p>
          <p className="text-xs text-muted-foreground">
            {campaign.producer.experience} años de experiencia
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
