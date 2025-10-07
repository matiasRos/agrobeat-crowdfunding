import { Calendar, Clock } from "lucide-react";
import { CampaignResponse } from "@/app/types/campaign";

interface CampaignTimelineProps {
  campaign: CampaignResponse;
}

export function CampaignTimeline({ campaign }: CampaignTimelineProps) {
  if (!campaign.timeline || !campaign.timeline.events.length) {
    return null;
  }

  const timeline = campaign.timeline;

  // Función para crear una fecha local sin problemas de zona horaria
  const createLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
  };

  const formatDate = (dateString: string) => {
    return createLocalDate(dateString).toLocaleDateString('es-PY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isEventPast = (dateString: string) => {
    const eventDate = createLocalDate(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const isEventToday = (dateString: string) => {
    const eventDate = createLocalDate(dateString);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime();
  };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        {timeline.title}
      </h3>
      <div className="relative">
        {timeline.events.map((event, index) => (
          <div key={index} className="flex gap-3 relative pb-2 last:pb-0">
            {/* Línea de tiempo visual */}
            <div className="flex flex-col items-center relative w-3 pt-2">
              <div className="relative">
                {/* Efecto de luz pulsante */}
                {isEventPast(event.date) && (
                  <div className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" />
                )}
                {isEventToday(event.date) && (
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-75 animate-ping" />
                )}
                {/* Punto principal */}
                <div
                  className={`w-3 h-3 rounded-full border-2 flex-shrink-0 z-10 relative ${isEventPast(event.date)
                      ? 'bg-green-500 border-green-500'
                      : isEventToday(event.date)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                />
              </div>
              {index < timeline.events.length - 1 && (
                <div className="w-0.5 bg-gray-200 absolute top-4 h-full left-1/2 transform -translate-x-1/2" />
              )}
            </div>

            {/* Contenido del evento */}
            <div className="flex-1 pt-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium text-md ${isEventPast(event.date)
                    ? 'text-green-700'
                    : isEventToday(event.date)
                      ? 'text-blue-700'
                      : 'text-gray-900'
                  }`}>
                  {event.title}
                </h4>
                {isEventToday(event.date) && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Hoy
                  </span>
                )}
                {isEventPast(event.date) && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ✓
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(event.date)}</span>
              </div>

              {event.description && (
                <p className="text-sm text-muted-foreground">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
