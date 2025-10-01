import { EmailTemplate, InvestmentConfirmationData } from './types';
import { baseEmailStyles, emailFooter } from './base-styles';

export function createInvestmentConfirmationTemplate(data: InvestmentConfirmationData): EmailTemplate {
  const { userName, campaignTitle, plantCount, formattedAmount, dashboardUrl } = data;

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Confirmación de Inversión - Agrobeat</title>
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
                  <p>Hola!</p>
                  <p>¡Excelente! Tu reserva de inversión ha sido procesada exitosamente. Gracias por confiar en Agrobeat y apoyar la agricultura nacional.</p>
                  <p>Gracias a nuestra tecnología, los productores podrán llevar adelante su campaña con mayor eficiencia, transparencia y confianza en cada etapa del proceso.</p>
                  
                  <div class="detail-box">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000;">📋 Detalles de tu inversión</p>
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

                  <p><strong>🚀 Próximos Pasos:</strong></p>
                  <p>1. Nuestro equipo revisará tu reserva en las próximas 24-48 horas<br>
                     2. Te contactaremos para coordinar el proceso de pago<br>
                     3. Recibirás actualizaciones regulares sobre tu inversión</p>

                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                    <tbody>
                      <tr>
                        <td align="center">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td> <a href="${dashboardUrl}" target="_blank">Ver mi Dashboard</a> </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p class="warning-box"><strong>⚠️ Importante:</strong> Esta es una reserva temporal. El proceso se completará una vez que coordinemos el pago contigo.</p>
                  
                  <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
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

¡Tu reserva de inversión ha sido confirmada!

Detalles:
- Campaña: ${campaignTitle}
- Plantas: ${plantCount}
- Monto: ${formattedAmount}

Nuestro equipo te contactará pronto para coordinar el proceso.

Saludos,
Equipo Agrobeat`;

  const subject = `✅ Confirmación de Inversión - ${campaignTitle}`;

  return { subject, html, text };
}
