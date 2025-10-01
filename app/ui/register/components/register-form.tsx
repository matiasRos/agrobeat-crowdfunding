'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

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

export function RegisterForm({
  className,
  action,
  isSubmitting,
  showLoginLink = true,
  ...props
}: React.ComponentProps<"div"> & {
  action: (formData: FormData) => Promise<{ error?: string; success?: string } | void>;
  isSubmitting?: boolean;
  showLoginLink?: boolean;
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const passwordsMatch = password === confirmPassword;
  const showPasswordError = confirmPassword.length > 0 && !passwordsMatch;
  const isLoading = isPending || isSubmitting;

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
        // Resetear el formulario
        setPassword('');
        setConfirmPassword('');
        const form = document.querySelector('form') as HTMLFormElement;
        if (form) {
          form.reset();
        }
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Ingresa tu información para crear una nueva cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
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
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password"
                  placeholder="Ingresa una contraseña segura"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={showPasswordError ? "border-red-500" : ""}
                  required 
                />
                {showPasswordError && (
                  <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <SubmitButton isPending={isLoading}>
                  Crear cuenta
                </SubmitButton>
              </div>
            </div>
            {showLoginLink && (
              <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Inicia sesión
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
