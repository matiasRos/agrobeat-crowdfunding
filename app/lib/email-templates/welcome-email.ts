import { EmailTemplate, WelcomeEmailData } from './types';

export function createWelcomeEmailTemplate(data: WelcomeEmailData): EmailTemplate {
  const { userName, dashboardUrl } = data;

  const html = `
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
    <a href="${dashboardUrl}" 
       style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Explorar Campañas
    </a>
  </div>
  
  <p>¡Comienza a invertir en el futuro de la agricultura!</p>
  
  <p>Saludos,<br>Equipo Agrobeat</p>
</div>
  `;

  const text = `¡Bienvenido a Agrobeat!

Hola ${userName},

Gracias por unirte a nuestra plataforma de inversión agrícola sostenible.

En Agrobeat puedes:
- Invertir en campañas agrícolas reales
- Hacer seguimiento de tus inversiones
- Obtener retornos atractivos
- Contribuir al desarrollo agrícola sostenible

¡Comienza a invertir en el futuro de la agricultura!

Visita: ${dashboardUrl}

Saludos,
Equipo Agrobeat`;

  const subject = '🌱 ¡Bienvenido a Agrobeat!';

  return { subject, html, text };
}
