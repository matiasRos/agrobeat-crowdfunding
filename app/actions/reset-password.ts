'use server';

import { db } from '@/app/lib/db';
import { users, passwordResetTokens } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt-ts';

/**
 * Verifica si un token es válido y no ha expirado
 */
async function validateResetToken(token: string): Promise<{
  valid: boolean;
  userId?: number;
  error?: string;
}> {
  try {
    // Buscar el token en la base de datos
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (!resetToken) {
      return { valid: false, error: 'Token inválido o no encontrado' };
    }

    // Verificar si el token ha expirado
    const now = new Date();
    if (now > resetToken.expiresAt) {
      // Eliminar token expirado
      await db
        .delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      return { valid: false, error: 'El token ha expirado' };
    }

    return { valid: true, userId: resetToken.userId };
  } catch (error) {
    console.error('Error validando token:', error);
    return { valid: false, error: 'Error al validar el token' };
  }
}

/**
 * Server action para verificar si un token es válido
 */
export async function verifyResetToken(token: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const result = await validateResetToken(token);
  return {
    valid: result.valid,
    error: result.error,
  };
}

/**
 * Server action para resetear la contraseña
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validar que la contraseña tenga al menos 8 caracteres
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres',
      };
    }

    // Validar el token
    const tokenValidation = await validateResetToken(token);
    if (!tokenValidation.valid || !tokenValidation.userId) {
      return {
        success: false,
        error: tokenValidation.error || 'Token inválido',
      };
    }

    // Hashear la nueva contraseña
    const hashedPassword = await hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tokenValidation.userId));

    // Eliminar el token usado (usar solo una vez)
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    console.log(`Contraseña reseteada exitosamente para usuario ID: ${tokenValidation.userId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return {
      success: false,
      error: 'Error al restablecer la contraseña. Inténtalo de nuevo.',
    };
  }
}

