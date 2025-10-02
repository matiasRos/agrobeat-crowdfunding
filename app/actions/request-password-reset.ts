'use server';

import { db } from '@/app/lib/db';
import { users, passwordResetTokens } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/app/lib/services/email';
import crypto from 'crypto';

/**
 * Genera un token criptográficamente seguro
 */
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calcula la fecha de expiración del token (1 hora desde ahora)
 */
function getExpirationDate(): Date {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora
  return expiresAt;
}

/**
 * Server action para solicitar el reseteo de contraseña
 * Siempre retorna éxito por seguridad (no revelar si el email existe)
 */
export async function requestPasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuario por email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Por seguridad, siempre retornamos el mismo mensaje
    // No revelamos si el usuario existe o no
    if (!user) {
      console.log(`Intento de reseteo para email no existente: ${normalizedEmail}`);
      return {
        success: true,
        message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.',
      };
    }

    // Generar token único
    const resetToken = generateResetToken();
    const expiresAt = getExpirationDate();

    // Eliminar tokens antiguos del usuario (si existen)
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    // Crear nuevo token en la base de datos
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // Enviar email con el link de reseteo
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name || 'Usuario',
      resetToken
    );

    if (!emailResult.success) {
      console.error('Error enviando email de reseteo:', emailResult.error);
      // No revelamos el error al usuario por seguridad
    }

    return {
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.',
    };
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    
    // Por seguridad, no revelamos detalles del error
    return {
      success: true,
      message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.',
    };
  }
}

