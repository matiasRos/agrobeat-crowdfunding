import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/app/ui/register/components/register-form';
import { createUser, getUser } from '@/app/db';
import { sendWelcomeEmail } from '@/app/lib/services/email';
import { UserPlus, Users } from 'lucide-react';

export function UserRegisterSection() {
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
      
      // Extraer el nombre del email (parte antes del @)
      const userName = email.split('@')[0];
      
      // Enviar correo de bienvenida con las credenciales (no bloqueamos el registro si falla)
      try {
        await sendWelcomeEmail(email, userName, password);
        console.log('Correo de bienvenida enviado a:', email);
      } catch (emailError) {
        console.error('Error enviando correo de bienvenida:', emailError);
        // No retornamos error, el usuario ya fue creado exitosamente
      }
      
      return { success: 'Usuario creado exitosamente. Se ha enviado un correo con las credenciales de acceso.' };
    } catch (error) {
      console.error('Error creating user:', error);
      return { error: 'Error al crear la cuenta. Inténtalo de nuevo.' };
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de Registro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registrar Nuevo Usuario
            </CardTitle>
            <CardDescription>
              Crea una nueva cuenta de usuario en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm 
              action={register} 
              showLoginLink={false}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
