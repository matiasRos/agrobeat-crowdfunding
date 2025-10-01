import { EmailTemplate, PaymentConfirmationData } from './types';
import { baseEmailStyles, emailFooter } from './base-styles';

export function createPaymentConfirmationTemplate(data: PaymentConfirmationData): EmailTemplate {
  const { userName, campaignTitle, plantCount, formattedAmount, dashboardUrl } = data;

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Pago Confirmado - Agrobeat</title>
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
                  <h2 style="color: #000000; margin-bottom: 24px;">¡Pago Confirmado!</h2>
                  
                  <p>Hola!,</p>
                  
                  <p>Hemos confirmado el pago de tu inversión. Tu participación en la campaña agrícola ahora está completamente activa.</p>
                  
                  <div class="detail-box">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000;">Detalles del pago</p>
                    <div class="detail-row">
                      <span class="detail-label">Campaña:&nbsp; </span>
                      <span class="detail-value">${campaignTitle}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Plantas adquiridas:&nbsp; </span>
                      <span class="detail-value">${plantCount} plantas</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Monto pagado:&nbsp; </span>
                      <span class="detail-value" style="font-size: 18px;">${formattedAmount}</span>
                    </div>
                  </div>

                  <p><strong>¿Qué sigue ahora?</strong></p>
                  <p>• Recibirás actualizaciones regulares sobre el progreso de tu inversión<br>
                     • Podrás hacer seguimiento en tiempo real desde tu dashboard<br>
                     • Te notificaremos sobre hitos importantes del cultivo<br>
                     • Al finalizar la campaña, recibirás tu retorno de inversión</p>

                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                    <tbody>
                      <tr>
                        <td align="center" style="    padding-top: 16px;">
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
                  
                  <p style="margin-top: 32px;">Gracias por confiar en Agrobeat y contribuir al desarrollo de la agricultura nacional.</p>
                  
                  <p>Saludos,<br><strong>Equipo Agrobeat</strong></p>
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

  const text = `¡Pago Confirmado!

Hola ${userName},

¡Excelentes noticias! Hemos confirmado el pago de tu inversión. Tu participación en la campaña agrícola ahora está completamente activa.

Detalles del pago confirmado:
- Campaña: ${campaignTitle}
- Plantas adquiridas: ${plantCount} plantas
- Monto pagado: ${formattedAmount}

¿Qué sigue ahora?
• Recibirás actualizaciones regulares sobre el progreso de tu inversión
• Podrás hacer seguimiento en tiempo real desde tu dashboard
• Te notificaremos sobre hitos importantes del cultivo
• Al finalizar la campaña, recibirás tu retorno de inversión

Visita tu dashboard: ${dashboardUrl}

Gracias por confiar en Agrobeat y contribuir al desarrollo de la agricultura nacional.

Saludos,
Equipo Agrobeat`;

  const subject = `✅ Pago Confirmado - ${campaignTitle}`;

  return { subject, html, text };
}
