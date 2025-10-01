import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/app/ui/register/components/register-form';
import { createUser, getUser } from '@/app/db';
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
      return { success: 'Usuario creado exitosamente' };
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

        {/* Información y Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>
              Estadísticas y configuración de usuarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Roles Disponibles</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• <span className="font-medium">Admin:</span> Acceso completo al sistema</div>
                <div>• <span className="font-medium">Investor:</span> Puede invertir en campañas</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Configuración por Defecto</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Rol por defecto: <span className="font-medium">Investor</span></div>
                <div>• Estado inicial: <span className="font-medium">Activo</span></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Próximas Funcionalidades</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Lista de usuarios existentes</div>
                <div>• Edición de roles y permisos</div>
                <div>• Activar/desactivar usuarios</div>
                <div>• Historial de actividad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
