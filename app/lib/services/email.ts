'use server';

import { Resend } from 'resend';

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export interface InvestmentEmailData {
  userEmail: string;
  userName: string;
  campaignTitle: string;
  plantCount: number;
  investmentAmount: number;
  campaignId: number;
}

export async function sendInvestmentConfirmationEmail(data: InvestmentEmailData) {
  try {
    const { userEmail, userName, campaignTitle, plantCount, investmentAmount, campaignId } = data;

    // Formatear moneda paraguaya
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'PYG',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formattedAmount = formatCurrency(investmentAmount);

    // Template HTML del email
    const emailHtml = `
     <!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>Confirmación de Inversión - Agrobeat</title>
    <style media="all" type="text/css">
    /* -------------------------------------
    GLOBAL RESETS
------------------------------------- */
    
    body {
      font-family: Helvetica, sans-serif;
      -webkit-font-smoothing: antialiased;
      font-size: 16px;
      line-height: 1.3;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    
    table {
      border-collapse: separate;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    
    table td {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      vertical-align: top;
    }
    /* -------------------------------------
    BODY & CONTAINER
------------------------------------- */
    
    body {
      background-color: #f4f5f6;
      margin: 0;
      padding: 0;
    }
    
    .body {
      background-color: #f4f5f6;
      width: 100%;
    }
    
    .container {
      margin: 0 auto !important;
      max-width: 600px;
      padding: 0;
      padding-top: 24px;
      width: 600px;
    }
    
    .content {
      box-sizing: border-box;
      display: block;
      margin: 0 auto;
      max-width: 600px;
      padding: 0;
    }
    /* -------------------------------------
    HEADER, FOOTER, MAIN
------------------------------------- */
    
    .main {
      background: #ffffff;
      border: 1px solid #eaebed;
      border-radius: 16px;
      width: 100%;
    }
    
    .wrapper {
      box-sizing: border-box;
      padding: 24px;
    }
    
    .footer {
      clear: both;
      padding-top: 24px;
      text-align: center;
      width: 100%;
    }
    
    .footer td,
    .footer p,
    .footer span,
    .footer a {
      color: #9a9ea6;
      font-size: 16px;
      text-align: center;
    }
    /* -------------------------------------
    TYPOGRAPHY
------------------------------------- */
    
    p {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      font-weight: normal;
      margin: 0;
      margin-bottom: 16px;
    }
    
    a {
      color: #000000;
      text-decoration: underline;
    }
    
    .investment-details {
      background-color: #f8f9fa;
      border-left: 4px solid #000000;
      padding: 16px;
      margin: 16px 0;
      border-radius: 4px;
    }
    
    .detail-row {
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    
    .detail-label {
      font-weight: 600;
      color: #666;
    }
    
    .detail-value {
      font-weight: 700;
      color: #333;
    }
    
    /* -------------------------------------
    BUTTONS
------------------------------------- */
    
    .btn {
      box-sizing: border-box;
      min-width: 100% !important;
      width: 100%;
    }
    
    .btn > tbody > tr > td {
      padding-bottom: 16px;
    }
    
    .btn table {
      width: auto;
    }
    
    .btn table td {
      background-color: #ffffff;
      border-radius: 4px;
      text-align: center;
    }
    
    .btn a {
      background-color: #ffffff;
      border: solid 2px #000000;
      border-radius: 4px;
      box-sizing: border-box;
      color: #000000;
      cursor: pointer;
      display: inline-block;
      font-size: 16px;
      font-weight: bold;
      margin: 0;
      padding: 12px 24px;
      text-decoration: none;
      text-transform: capitalize;
    }
    
    .btn-primary table td {
      background-color: #000000;
    }
    
    .btn-primary a {
      background-color: #000000;
      border-color: #000000;
      color: #ffffff;
    }
    
    @media all {
      .btn-primary table td:hover {
        background-color: #171717e6 !important;
      }
      .btn-primary a:hover {
        background-color: #171717e6 !important;
        border-color: #171717e6 !important;
      }
    }
    
    /* -------------------------------------
    RESPONSIVE AND MOBILE FRIENDLY STYLES
------------------------------------- */
    
    @media only screen and (max-width: 640px) {
      .main p,
      .main td,
      .main span {
        font-size: 16px !important;
      }
      .wrapper {
        padding: 8px !important;
      }
      .content {
        padding: 0 !important;
      }
      .container {
        padding: 0 !important;
        padding-top: 8px !important;
        width: 100% !important;
      }
      .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }
      .btn table {
        max-width: 100% !important;
        width: 100% !important;
      }
      .btn a {
        font-size: 16px !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      .detail-row {
        flex-direction: column;
      }
    }
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
                  <p>Hola!</strong>,</p>
                  <p>¡Excelente! Tu reserva de inversión ha sido procesada exitosamente. Gracias por confiar en Agrobeat y apoyar la agricultura nacional.</p>
                  <p>Gracias a nuestra tecnología, los productores podrán llevar adelante su campaña con mayor eficiencia, transparencia y confianza en cada etapa del proceso.</p>
                  <div class="investment-details">
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
                                <td> <a href="${process.env.NEXTAUTH_URL}/dashboard" target="_blank">Ver mi Dashboard</a> </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 12px; color: #856404;"><strong>⚠️ Importante:</strong> Esta es una reserva temporal. El proceso se completará una vez que coordinemos el pago contigo.</p>
                  
                  <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </td>
              </tr>

              <!-- END MAIN CONTENT AREA -->
              </table>

            <!-- START FOOTER -->
            <div class="footer">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="content-block">
                    <span class="apple-link"><strong>Agrobeat | Inviertiendo en el futuro de la agricultura</strong></span>
                    <br>Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
                  </td>
                </tr>
                <tr>
                  <td class="content-block powered-by">
                    © 2025 Agrobeat. Todos los derechos reservados.
                  </td>
                </tr>
              </table>
            </div>

            <!-- END FOOTER -->
            
<!-- END CENTERED WHITE CONTAINER --></div>
        </td>
        <td>&nbsp;</td>
      </tr>
    </table>
  </body>
</html>
    `;

    // Configurar el remitente usando tu dominio verificado
    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';

    // Enviar email
    const result = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: `✅ Confirmación de Inversión - ${campaignTitle}`,
      html: emailHtml,
      text: `Hola ${userName},

¡Tu reserva de inversión ha sido confirmada!

Detalles:
- Campaña: ${campaignTitle}
- Plantas: ${plantCount}
- Monto: ${formattedAmount}

Nuestro equipo te contactará pronto para coordinar el proceso.

Saludos,
Equipo Agrobeat`,
    });

    console.log('Email enviado exitosamente:', result);
    return { success: true, messageId: result.data?.id };

  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para enviar emails de bienvenida (opcional)
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'Agrobeat <noreply@tudominio.com>';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: '🌱 ¡Bienvenido a Agrobeat!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a;">🌱 ¡Bienvenido a Agrobeat!</h1>
          </div>
          
          <p>Hola <strong>${userName}</strong>,</p>
          
          <p>Gracias por unirte a nuestra plataforma de inversión agrícola sostenible.</p>
          
          <p>En Agrobeat puedes:</p>
          <ul>
            <li>🌱 Invertir en campañas agrícolas reales</li>
            <li>📊 Hacer seguimiento de tus inversiones</li>
            <li>💰 Obtener retornos atractivos</li>
            <li>🌍 Contribuir al desarrollo agrícola sostenible</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Explorar Campañas
            </a>
          </div>
          
          <p>¡Comienza a invertir en el futuro de la agricultura!</p>
          
          <p>Saludos,<br>Equipo Agrobeat</p>
        </div>
      `,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
