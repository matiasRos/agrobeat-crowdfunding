import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface InvalidTokenMessageProps {
  error?: string;
}

export function InvalidTokenMessage({ error }: InvalidTokenMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Token inválido o expirado
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || 'El enlace de restablecimiento no es válido o ha expirado.'}
              {' '}Los enlaces de restablecimiento expiran después de 1 hora por seguridad.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full">
                Solicitar nuevo enlace
              </Button>
            </Link>
            <div className="mt-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

