import { EmailTemplate, AdminNotificationData } from './types';
import { baseEmailStyles, emailFooter } from './base-styles';

export function createAdminNotificationTemplate(data: AdminNotificationData): EmailTemplate {
  const { userName, userEmail, campaignTitle, plantCount, formattedAmount } = data;

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Nueva Inversión - Agrobeat Admin</title>
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
                  <p><strong>🚨 Nueva Inversión - Agrobeat Admin</strong></p>
                  <p>Se ha registrado una nueva reserva de inversión que requiere seguimiento.</p>
                  
                  <div class="detail-box">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000;">📋 Detalles de la inversión</p>
                    <div class="detail-row">
                      <span class="detail-label">Nombre: </span>
                      <span class="detail-value">${userName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Email: </span>
                      <span class="detail-value">${userEmail}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Campaña: </span>
                      <span class="detail-value">${campaignTitle}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Plantas reservadas: </span>
                      <span class="detail-value">${plantCount} plantas</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Monto total: </span>
                      <span class="detail-value" style="color: #000000; font-size: 18px;">${formattedAmount}</span>
                    </div>
                  </div>

                  <p><strong>⚡ Acción requerida:</strong></p>
                  <p>El usuario con email: <strong>${userEmail}</strong>, reservó <strong>${plantCount} plantas</strong>. Favor contactar con él para continuar con el pago.</p>
                  
                  <p class="warning-box"><strong>📞 Recordatorio:</strong> Contactar al usuario dentro de las próximas 24-48 horas para coordinar el proceso de pago.</p>
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

  const text = `Nueva inversión registrada:

Usuario: ${userEmail}
Nombre: ${userName}
Campaña: ${campaignTitle}
Plantas: ${plantCount}
Monto: ${formattedAmount}

El usuario con email: ${userEmail}, reservó ${plantCount} plantas. Favor contactar con él para continuar con el pago.

Agrobeat Admin`;

  const subject = `🚨 Nueva Inversión: ${plantCount} plantas - ${campaignTitle}`;

  return { subject, html, text };
}
