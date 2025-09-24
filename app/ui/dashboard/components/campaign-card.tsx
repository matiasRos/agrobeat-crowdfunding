import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Clock, TrendingUp } from "lucide-react";
import { CampaignResponse } from "@/app/types/campaign";
import Link from "next/link";
import Image from "next/image";

interface CampaignCardProps {
  campaign: CampaignResponse;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage = (parseFloat(campaign.raisedAmount) / parseFloat(campaign.targetAmount)) * 100;
  
  // Función para formatear el tiempo restante
  const formatTimeRemaining = (daysLeft: number) => {
    if (daysLeft <= 0) {
      return { text: 'Cerrada', color: 'text-red-600' };
    }
    if (daysLeft === 1) {
      return { text: 'Último día', color: 'text-red-600' };
    }
    if (daysLeft <= 3) {
      return { text: `${daysLeft} días`, color: 'text-red-600' };
    }
    if (daysLeft <= 7) {
      return { text: `${daysLeft} días`, color: 'text-orange-600' };
    }
    return { text: `${daysLeft} días`, color: 'text-muted-foreground' };
  };
  
  const timeInfo = formatTimeRemaining(campaign.daysLeft);
  

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          className="h-full w-full object-cover"
          width={500}
          height={500}
        />
        
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-1">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {campaign.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{campaign.location}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {campaign.crop}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progreso de financiamiento */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Recaudado</span>
            <span className="font-medium">
              {formatCurrency(parseFloat(campaign.raisedAmount))} de {formatCurrency(parseFloat(campaign.targetAmount))}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{campaign.investorCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Inversores</p>
          </div>
          
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className={`h-3 w-3 ${timeInfo.color}`} />
                    <span className={`text-sm font-medium ${timeInfo.color}`}>
                      {timeInfo.text}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {campaign.daysLeft > 0 ? 'Restante' : 'Estado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(campaign.closingDate).toLocaleDateString('es-PY', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{parseFloat(campaign.expectedReturn)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Retorno est.</p>
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

            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/dashboard/campaigns/${campaign.id}`}>
                  Ver Detalles
                </Link>
              </Button>
            </CardFooter>
    </Card>
  );
}
