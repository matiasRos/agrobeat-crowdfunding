import { EmailTemplate, NewCampaignNotificationData } from './types';
import { baseEmailStyles, emailFooter } from './base-styles';

export function createNewCampaignNotificationTemplate(data: NewCampaignNotificationData): EmailTemplate {
  const { userName, campaignTitle, campaignDescription, crop, location, expectedReturn, closingDate, campaignUrl } = data;

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Nueva Campaña Disponible - Agrobeat</title>
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
                  <p>Hola ${userName}!</p>
                  <p>¡Tenemos excelentes noticias! Una nueva oportunidad de inversión agrícola acaba de estar disponible en Agrobeat. 🌱</p>
                  <p>Esta es tu oportunidad para apoyar la agricultura nacional y obtener retornos atractivos en tu inversión.</p>
                  
                  <div class="detail-box">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000; font-size: 20px;">🌾 ${campaignTitle}</p>
                    <p style="margin-bottom: 16px; color: #666;">${campaignDescription}</p>
                    <div class="detail-row">
                      <span class="detail-label">🌿 Cultivo: </span>
                      <span class="detail-value">${crop}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">📍 Ubicación: </span>
                      <span class="detail-value">${location}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">📈 Retorno esperado: </span>
                      <span class="detail-value" style="color: #059669; font-size: 18px;">${expectedReturn}%</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">📅 Cierre de campaña: </span>
                      <span class="detail-value">${closingDate}</span>
                    </div>
                  </div>

                  <p><strong>✨ ¿Por qué invertir en esta campaña?</strong></p>
                  <p>• Apoya a productores locales comprometidos<br>
                     • Tecnología de seguimiento en tiempo real<br>
                     • Transparencia total en cada etapa del proceso<br>
                     • Retornos atractivos en el sector agrícola</p>

                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                    <tbody>
                      <tr>
                        <td align="center">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td> <a href="${campaignUrl}" target="_blank">Ver Campaña Completa</a> </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p class="warning-box"><strong>⏰ ¡No esperes demasiado!</strong> Las plazas son limitadas y esta oportunidad cierra el ${closingDate}.</p>
                  
                  <p>Si tienes alguna pregunta sobre esta campaña, no dudes en contactarnos. Estamos aquí para ayudarte.</p>
                  
                  <p style="margin-top: 24px;">¡Gracias por ser parte de Agrobeat y contribuir al futuro de la agricultura!</p>
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

  const text = `Hola ${userName},

¡Nueva campaña disponible en Agrobeat!

${campaignTitle}
${campaignDescription}

Detalles:
- Cultivo: ${crop}
- Ubicación: ${location}
- Retorno esperado: ${expectedReturn}%
- Cierre: ${closingDate}

¡No te pierdas esta oportunidad de inversión!

Ver más: ${campaignUrl}

Saludos,
Equipo Agrobeat`;

  const subject = `🌱 Nueva Oportunidad de Inversión: ${campaignTitle}`;

  return { subject, html, text };
}

