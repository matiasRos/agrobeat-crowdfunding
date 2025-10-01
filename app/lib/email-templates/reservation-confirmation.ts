import { EmailTemplate, ReservationConfirmationData } from './types';
import { baseEmailStyles, emailFooter } from './base-styles';

export function createReservationConfirmationTemplate(data: ReservationConfirmationData): EmailTemplate {
  const { userName, campaignTitle, plantCount, formattedAmount, whatsappLink, whatsappNumber } = data;

  const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Reserva Confirmada - Agrobeat</title>
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
                  <h2 style="color: #000000; margin-bottom: 24px;">Reserva Confirmada</h2>
                  
                  <p>Hola,</p>
                  
                  <div class="detail-box">
                    <p style="margin-bottom: 16px; font-weight: bold; color: #000000;">Detalle de tu reserva:</p>
                    <div class="detail-row">
                      <span class="detail-label">Cantidad de plantas:&nbsp;</span>
                      <span class="detail-value">${plantCount} plantas de ${campaignTitle.toLowerCase()}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Monto total a invertir:&nbsp;</span>
                      <span class="detail-value" style="color: #000000; font-size: 18px;">${formattedAmount}</span>
                    </div>
                  </div>

                  <p>Para completar el proceso, por favor realizá la transferencia a la siguiente cuenta:</p>
                  
                  <div class="bank-details">
                    <p style="margin-bottom: 12px; font-weight: bold; color:#000000;">Datos Bancarios</p>
                    <p style="margin-bottom: 8px;"><strong>Banco:</strong> Itaú</p>
                    <p style="margin-bottom: 8px;"><strong>Cuenta N°:</strong> 321311711</p>
                    <p style="margin-bottom: 8px;"><strong>Titular:</strong> Jonathan Funes</p>
                    <p style="margin-bottom: 8px;"><strong>CI:</strong> 5244365</p>
                    <p style="margin-bottom: 0;"><strong>Alias:</strong> 5244365 CI</p>
                  </div>

                  <p>Una vez realizada la transferencia, te pedimos enviar el comprobante de pago para registrar la operación al siguiente número de teléfono:</p>
                  
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-whatsapp">
                    <tbody>
                      <tr>
                        <td align="center">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td> <a href="${whatsappLink}" target="_blank">📱 Enviar comprobante por WhatsApp</a> </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p style="margin-top: 32px;">Muchas gracias por tu confianza.</p>
                  
                  <p>Atentamente,<br>Agrobeat</p>
                  
                  <p class="warning-box" style="font-size: 14px; margin-top: 32px;">
                    <strong>⚠️ Importante:</strong> Si no esperabas esta confirmación de inversión, podés ignorar este mensaje. Ante cualquier duda sobre la seguridad o validez de la información, por favor comunicate a nuestro número de teléfono <a href="${whatsappLink}" class="whatsapp-link" target="_blank">${whatsappNumber}</a>
                  </p>
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

  const text = `Reserva Confirmada

Hola ${userName},

Detalle de tu reserva:
- Cantidad de plantas: ${plantCount} plantas de ${campaignTitle.toLowerCase()}
- Monto total a invertir: ${formattedAmount}

Para completar el proceso, por favor realizá la transferencia a la siguiente cuenta:

Banco Itaú
Cuenta N°: 321311711
Titular: Jonathan Funes
CI: 5244365
Alias: 5244365 CI

Una vez realizada la transferencia, te pedimos enviar el comprobante de pago para registrar la operación al siguiente número de teléfono: ${whatsappNumber}

Muchas gracias por tu confianza.

Atentamente,
Agrobeat

Si no esperabas esta confirmación de inversión, podés ignorar este mensaje. Ante cualquier duda sobre la seguridad o validez de la información, por favor comunicate a nuestro número de teléfono ${whatsappNumber}`;

  const subject = `💳 Reserva Confirmada - Completá tu pago para ${campaignTitle}`;

  return { subject, html, text };
}
