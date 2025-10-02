'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { resetPassword } from '@/app/actions/reset-password';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [passwordReset, setPasswordReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones
    if (!password || !confirmPassword) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetPassword(token, password);
        
        if (result.success) {
          setPasswordReset(true);
          toast.success('Contraseña restablecida exitosamente');
          
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          toast.error(result.error || 'Error al restablecer la contraseña');
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

              {!passwordReset ? (
                <>
                  {/* Título y descripción */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Restablecer contraseña
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Ingresa tu nueva contraseña
                    </p>
                  </div>

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nueva contraseña */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Nueva contraseña</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 8 caracteres"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isPending}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Repite la contraseña"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isPending}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Indicador de fortaleza de contraseña */}
                    {password.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className={cn(
                            "h-1 flex-1 rounded transition-colors",
                            password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                          )} />
                          <div className={cn(
                            "h-1 flex-1 rounded transition-colors",
                            password.length >= 12 ? "bg-green-500" : "bg-gray-300"
                          )} />
                          <div className={cn(
                            "h-1 flex-1 rounded transition-colors",
                            /[A-Z]/.test(password) && /[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"
                          )} />
                        </div>
                        <p className={cn(
                          "text-xs",
                          password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) 
                            ? "text-green-600 font-medium" 
                            : "text-muted-foreground"
                        )}>
                          {password.length < 8 && "La contraseña debe tener al menos 8 caracteres"}
                          {password.length >= 8 && password.length < 12 && "Contraseña aceptable"}
                          {password.length >= 12 && !(/[A-Z]/.test(password) && /[0-9]/.test(password)) && "Contraseña fuerte (agrega mayúsculas y números)"}
                          {password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && "✓ Contraseña muy fuerte"}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          Restableciendo...
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
                        'Restablecer contraseña'
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
                      ¡Contraseña restablecida!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Tu contraseña ha sido restablecida exitosamente. 
                      Ahora puedes iniciar sesión con tu nueva contraseña.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-900">
                        Serás redirigido al inicio de sesión en unos segundos...
                      </p>
                    </div>
                    <Link href="/login">
                      <Button className="w-full">
                        Ir al inicio de sesión
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

