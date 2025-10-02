import { EmailTemplate, WelcomeEmailData } from './types';
import { baseEmailStyles, emailFooter } from './base-styles';

export function createWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
  const { userName, userEmail, userPassword, dashboardUrl } = data;

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>¡Bienvenido a Agrobeat!</title>
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
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="main">
              <tr>
                <td class="wrapper">
                  <p style="font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 24px;">¡Bienvenido a Agrobeat!</p>
                  
                  <p>Hola <strong>${userName}</strong>,</p>
                  
                  <p>Gracias por unirte a nuestra plataforma de inversión agrícola. Estamos emocionados de tenerte con nosotros.</p>
                  
                  <p>Hemos creado tu cuenta y aquí están tus credenciales de acceso:</p>

                  <div class="bank-details">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000;">Tus datos de acceso</p>
                    <div class="detail-row">
                      <span class="detail-label">Email:&nbsp;</span>
                      <span class="detail-value">${userEmail}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Contraseña:&nbsp;</span>
                      <span class="detail-value">${userPassword}</span>
                    </div>
                  </div>

                  <p class="warning-box"><strong>⚠️ Importante:&nbsp;</strong>Para mayor seguridad, te recomendamos cambiar tu contraseña con el link '¿Olvidaste tu contraseña?' en la página de inicio de sesión.</p>
                  
                  <div class="detail-box">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000;">En Agrobeat puedes:</p>
                    <p style="margin-bottom: 8px;"><strong>Invertir en campañas agrícolas</strong> y apoyar a productores locales</p>
                    <p style="margin-bottom: 8px;"><strong>Hacer seguimiento de tus inversiones</strong> en tiempo real desde tu dashboard</p>
                    <p style="margin-bottom: 8px;"><strong>Obtener retornos</strong> al finalizar las campañas</p>
                    <p style="margin-bottom: 8px;"><strong>Contribuir al desarrollo sostenible</strong> del sector agrícola</p>
                  </div>

                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                    <tbody>
                      <tr>
                        <td align="center">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td>
                                  <a href="${dashboardUrl}" target="_blank">Explorar Campañas</a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p style="margin-top: 24px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
                  
                  <p style="margin-top: 16px;">Saludos,<br><strong>Equipo Agrobeat</strong></p>
                </td>
              </tr>
            </table>
            ${emailFooter}
          </div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
  `;

  const text = `¡Bienvenido a Agrobeat!

Hola ${userName},

Gracias por unirte a nuestra plataforma de inversión agrícola sostenible. Estamos emocionados de tenerte con nosotros.

Hemos creado tu cuenta y aquí están tus credenciales de acceso:

🔐 TUS DATOS DE ACCESO
Email: ${userEmail}
Contraseña: ${userPassword}

⚠️ IMPORTANTE: Te recomendamos cambiar tu contraseña con el link 'Olvidé mi contraseña' en la página de inicio de sesión.

En Agrobeat puedes:
- 🌱 Invertir en campañas agrícolas reales y apoyar a productores locales
- 📊 Hacer seguimiento de tus inversiones en tiempo real desde tu dashboard
- 💰 Obtener retornos atractivos al finalizar las campañas
- 🌍 Contribuir al desarrollo sostenible del sector agrícola

¡Comienza hoy mismo a invertir en el futuro de la agricultura!

Visita tu dashboard: ${dashboardUrl}

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
Equipo Agrobeat

---
Agrobeat | Inviertiendo en el futuro de la agricultura
Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
© 2025 Agrobeat. Todos los derechos reservados.`;

  const subject = '🌱 ¡Bienvenido a Agrobeat!';

  return { subject, html, text };
}
