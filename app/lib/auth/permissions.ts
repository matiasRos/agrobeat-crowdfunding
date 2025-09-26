import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

export type UserRole = 'admin' | 'investor';

/**
 * Verifica si el usuario tiene el rol requerido
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  if (session.user.role !== requiredRole) {
    redirect('/dashboard'); // Redirigir a dashboard si no tiene permisos
  }
  
  return session;
}

/**
 * Verifica si el usuario tiene alguno de los roles permitidos
 */
export async function requireAnyRole(allowedRoles: UserRole[]) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect('/dashboard'); // Redirigir a dashboard si no tiene permisos
  }
  
  return session;
}

/**
 * Verifica si el usuario está autenticado
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return session;
}
