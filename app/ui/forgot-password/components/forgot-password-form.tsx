'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { requestPasswordReset } from '@/app/actions/request-password-reset';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    startTransition(async () => {
      try {
        const result = await requestPasswordReset(email);
        
        if (result.success) {
          setEmailSent(true);
          toast.success('Correo enviado', {
            description: 'Revisa tu bandeja de entrada',
          });
        } else {
          toast.error('Error al enviar el correo');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error inesperado. Inténtalo de nuevo.');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-8">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/logo-agrobeat-light.png"
                  alt="AgroBeat"
                  width={140}
                  height={37}
                  className="h-9 w-auto"
                  unoptimized
                />
              </div>

              {!emailSent ? (
                <>
                  {/* Título y descripción */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      No te preocupes, te enviaremos instrucciones para restablecerla
                    </p>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="usuario@ejemplo.com"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isPending}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          Enviando...
                          <svg
                            className="animate-spin ml-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        </>
                      ) : (
                        'Enviar instrucciones'
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  {/* Mensaje de éxito */}
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      ¡Revisa tu correo!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Si existe una cuenta con el correo <strong>{email}</strong>, 
                      recibirás instrucciones para restablecer tu contraseña.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
                      <p className="text-sm text-blue-900">
                        <strong>💡 Consejo:</strong> Si no recibes el correo en unos minutos, 
                        revisa tu carpeta de spam o correo no deseado.
                      </p>
                    </div>
                    <Link href="/login">
                      <Button className="w-full">
                        Volver al inicio de sesión
                      </Button>
                    </Link>
                  </div>
                </>
              )}

              {/* Link para volver al login */}
              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer informativo */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          <p>
            Por tu seguridad, el enlace de restablecimiento expirará en 1 hora
          </p>
        </div>
      </div>
    </div>
  );
}

