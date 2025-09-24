import { RegisterForm } from '@/app/ui/register/components/register-form';
import { redirect } from 'next/navigation';
import { createUser, getUser } from '@/app/db';

export default function Register() {
  async function register(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }
    
    // Verificar si el usuario ya existe
    const user = await getUser(email);
    
    if (user.length > 0) {
      throw new Error('El usuario ya existe');
    }
    
    await createUser(email, password);
    redirect('/login');
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm action={register} />
      </div>
    </div>
  );
}
