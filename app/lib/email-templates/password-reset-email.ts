import { baseEmailStyles, emailFooter } from './base-styles';
import type { EmailTemplate } from './types';

interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expirationTime: string; // e.g., "1 hora"
}

export function createPasswordResetEmailTemplate(
  data: PasswordResetEmailData
): EmailTemplate {
  const { userName, resetLink, expirationTime } = data;

  const subject = 'Restablece tu contraseña - Agrobeat';

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>${subject}</title>
    <style media="all" type="text/css">
    ${baseEmailStyles}
    </style>
  </head>
  <body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
      <tr>
        <td>&nbsp;</td>
        <td class="container">
          <div class="content">
            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper">
                  <h2 style="margin-bottom: 24px;">Restablece tu contraseña</h2>
                  
                  <p>Hola,</p>
                  
                  <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
                  
                  <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
                  
                  <!-- CTA Button -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                    <tbody>
                      <tr>
                        <td align="center">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td> <a href="${resetLink}" target="_blank">Restablecer contraseña</a> </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p style="margin-top: 16px; font-size: 14px; color: #666;">
                    O copia y pega este enlace en tu navegador:
                  </p>
                  <p style="word-break: break-all; font-size: 14px; color: #4a5568; background: #f8f9fa; padding: 12px; border-radius: 4px;">
                    ${resetLink}
                  </p>
                  
                  <!-- Warning Box -->
                  <div class="warning-box" style="margin-top: 24px;">
                    <p style="margin: 0; font-weight: 600; margin-bottom: 8px;">
                      ⚠️ Importante
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                      Este enlace expirará en <strong>${expirationTime}</strong> por motivos de seguridad. 
                      Si necesitas un nuevo enlace, puedes solicitar otro desde la página de inicio de sesión.
                    </p>
                  </div>
                  
                  <p style="margin-top: 32px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                  
                  <p>Atentamente,<br>Agrobeat</p>
                </td>
              </tr>
              <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- START FOOTER -->
            ${emailFooter}
            <!-- END FOOTER -->
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
  `;

  const text = `
Restablece tu contraseña - Agrobeat

Hola ${userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en Agrobeat.
Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.

Para restablecer tu contraseña, visita el siguiente enlace:
${resetLink}

IMPORTANTE: Este enlace expirará en ${expirationTime} por motivos de seguridad.

Consejos de seguridad:
- Elige una contraseña fuerte y única
- No compartas tu contraseña con nadie
- Usa una combinación de letras, números y símbolos
- Considera usar un administrador de contraseñas

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

---
Agrobeat
Invierte en el futuro del agro

Este es un correo automático, por favor no respondas a este mensaje.
  `.trim();

  return {
    subject,
    html,
    text,
  };
}

