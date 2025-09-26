import { signIn } from '@/app/auth';
import { LoginForm } from '@/app/ui/login/components/login-form';
import { AuthError } from 'next-auth';

export default function Login() {
  async function authenticate(formData: FormData) {
    'use server';
    
    try {
      await signIn('credentials', {
        redirectTo: '/dashboard',
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return { error: 'Credenciales incorrectas. Verifica tu email y contraseña.' };
          default:
            return { error: 'Error al iniciar sesión. Inténtalo de nuevo.' };
        }
      }
      throw error;
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md md:max-w-3xl">
        <LoginForm action={authenticate} />
      </div>
    </div>
  );
}
