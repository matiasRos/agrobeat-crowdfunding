import { RegisterForm } from '@/app/ui/register/components/register-form';
import { redirect } from 'next/navigation';
import { createUser, getUser } from '@/app/db';
import { requireRole } from '@/app/lib/auth/permissions';

export default async function Register() {
  // Solo los admins pueden acceder a esta página
  await requireRole('admin');
  async function register(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return { error: 'Las contraseñas no coinciden' };
    }
    
    // Verificar si el usuario ya existe
    const user = await getUser(email);
    
    if (user.length > 0) {
      return { error: 'El usuario ya existe' };
    }
    
    try {
      await createUser(email, password);
      redirect('/login');
    } catch (error) {
      console.error('Error creating user:', error);
      return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' };
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm action={register} />
      </div>
    </div>
  );
}
