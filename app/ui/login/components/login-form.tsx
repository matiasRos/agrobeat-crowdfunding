'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useTransition } from 'react';

function SubmitButton({ 
  children, 
  isPending 
}: { 
  children: React.ReactNode;
  isPending?: boolean;
}) {
  const { pending } = useFormStatus();
  const isLoading = pending || isPending;

  return (
    <Button
      type={isLoading ? 'button' : 'submit'}
      aria-disabled={isLoading}
      className="w-full"
      disabled={isLoading}
    >
      {children}
      {isLoading && (
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
      )}
      <span aria-live="polite" className="sr-only" role="status">
        {isLoading ? 'Loading' : 'Submit form'}
      </span>
    </Button>
  );
}

export function LoginForm({
  className,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 md:min-h-[600px]">
          <form className="p-6 md:p-8 flex items-center" action={handleSubmit}>
            <div className="flex flex-col gap-12 w-full">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  <Image
                    src="/logo-agrobeat-light.png"
                    alt="AgroBeat"
                    width={120}
                    height={32}
                    className="h-8 w-auto dark:hidden"
                    unoptimized
                  />
                </div>
                <p className="text-muted-foreground text-balance">
                  Inicia sesión en tu cuenta
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    {/*  <Link
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>*/}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
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
                      <span className="sr-only">
                        {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      </span>
                    </Button>
                  </div>
                </div>
                <SubmitButton isPending={isPending}>
                  Iniciar sesión
                </SubmitButton>
              </div>


              {/*<div className="text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <Link href="/register" className="underline underline-offset-4">
                  Regístrate
                </Link>
              </div> */}
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/image-login.jpg"
              alt="AgroBeat"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      {/*<div className="text-muted-foreground text-center text-xs text-balance">
        Al continuar, aceptas nuestros{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Términos de Servicio
        </Link>{" "}
        y{" "}
        <Link href="#" className="underline underline-offset-4 hover:text-primary">
          Política de Privacidad
        </Link>.
      </div>*/}
    </div>
  );
}
