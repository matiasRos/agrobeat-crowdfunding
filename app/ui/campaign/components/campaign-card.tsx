import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Clock, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { CampaignResponse } from "@/app/types/campaign";
import { formatTimeRemaining, formatCurrency, calculatePlantAvailability } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CampaignCardProps {
  campaign: CampaignResponse;

}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progressPercentage = (parseFloat(campaign.raisedAmount) / parseFloat(campaign.targetAmount)) * 100;

  const timeInfo = formatTimeRemaining(campaign.daysLeft, {
    context: 'card',
    includeCssClass: true
  });

  // Verificar disponibilidad de plantas
  const availability = calculatePlantAvailability(campaign);
  const isCampaignClosed = campaign.daysLeft <= 0 || availability.isFullyFunded;

  // Prioridad: si está 100% financiada, mostrar eso sin importar el tiempo
  const isFullyFunded = availability.isFullyFunded;
  const isClosedByTime = campaign.daysLeft <= 0 && !isFullyFunded;

  return (
    <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer">
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
        <Image
          src={campaign.imageUrl}
          alt={campaign.title}
          className={`h-full w-full object-cover transition-all duration-300 ${campaign.isInvestedByUser ? 'blur-sm scale-105' : ''
            }`}
          width={500}
          height={500}
        />

        {/* Indicador de campaña ya reservada - centrado */}
        {campaign.isInvestedByUser && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="secondary" className="bg-green-500 text-white border-green-600 px-4 py-2 text-sm font-semibold shadow-lg hover:bg-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Reservado
            </Badge>
          </div>
        )}

        {/* Indicador de campaña cerrada por tiempo (solo si NO está 100% financiada) */}
        {!campaign.isInvestedByUser && isClosedByTime && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="secondary" className="bg-gray-600 text-white border-gray-700 px-4 py-2 text-sm font-semibold shadow-lg">
              <XCircle className="h-4 w-4 mr-2" />
              Cerrada
            </Badge>
          </div>
        )}
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
              <Clock className={`h-3 w-3 ${isFullyFunded ? 'text-green-600' :
                  isClosedByTime ? 'text-gray-600' :
                    timeInfo.color
                }`} />
              <span className={`text-sm font-medium ${isFullyFunded ? 'text-green-600' :
                  isClosedByTime ? 'text-gray-600' :
                    timeInfo.color
                }`}>
                {isCampaignClosed ? 'Cerrada' : timeInfo.text}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isFullyFunded
                ? '100% financiada'
                : isClosedByTime
                  ? 'Fecha límite alcanzada'
                  : 'Restante'
              }
            </p>
            {/* Mostrar fecha solo si NO está 100% financiada */}
            {!isFullyFunded && (
              <p className="text-xs text-muted-foreground">
                {new Date(campaign.closingDate).toLocaleDateString('es-PY', {
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{parseFloat(campaign.expectedReturn)}%</span>
            </div>
            <p className="text-xs text-muted-foreground">de la rentabilidad</p>
          </div>
        </div>

        {/* Productor */}
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Productor</p>
          <p className="text-sm font-medium">{campaign.producer.name}</p>
          <p className="text-xs text-muted-foreground">
            {campaign.producer.experience} años de experiencia
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant="default"
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}
