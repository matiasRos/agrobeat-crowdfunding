'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en la página de dashboard:', error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error en el dashboard
        </h2>
        <p className="text-gray-600 mb-4">
          Ha ocurrido un error al cargar esta sección del dashboard. 
          Intenta recargar la página o contacta al administrador si el problema persiste.
        </p>

        <Button className="mt-4" onClick={() => reset()}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reintentar
        </Button>
      </div>
    </main>
  );
} 