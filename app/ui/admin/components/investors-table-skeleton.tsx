import { Skeleton } from '@/components/ui/skeleton';

export function InvestorsTableSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header de la tabla */}
      <div className="grid grid-cols-7 gap-4 p-4 border-b">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      
      {/* Filas de la tabla */}
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-7 gap-4 p-4">
          {Array.from({ length: 7 }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}
