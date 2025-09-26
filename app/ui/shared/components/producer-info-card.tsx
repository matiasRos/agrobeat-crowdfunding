import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Award,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface Producer {
  name: string;
  experience: number;
}

interface ProducerInfoCardProps {
  producer: Producer;
  location: string;
  mapsLink?: string;
  showTitle?: boolean;
  className?: string;
  avatarUrl?: string;
}

export function ProducerInfoCard({ 
  producer, 
  location, 
  mapsLink, 
  showTitle = true,
  className = "",
  avatarUrl
}: ProducerInfoCardProps) {
  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Productor
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/osval-foto.jpg" alt={producer.name} />
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                {getInitials(producer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{producer.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{producer.experience} años de experiencia</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Award className="h-4 w-4" /> Verificado
          </Badge>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span><strong>Ubicación:</strong> {location}</span>
            </div>
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Ver en Maps
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
