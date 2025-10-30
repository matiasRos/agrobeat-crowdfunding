# Ejemplos de Uso - Servicio de WhatsApp

Este documento contiene ejemplos prácticos de cómo usar el servicio de WhatsApp en Agrobeat.

## 📱 Tabla de Contenidos

1. [Mensajes de Texto Simple](#mensajes-de-texto-simple)
2. [Plantillas de WhatsApp](#plantillas-de-whatsapp)
3. [Casos de Uso Comunes](#casos-de-uso-comunes)
4. [Crear Plantillas en Meta](#crear-plantillas-en-meta)

---

## Mensajes de Texto Simple

### Enviar un mensaje básico

```typescript
import { sendTextMessage } from '@/app/lib/services/whatsapp';

const result = await sendTextMessage({
  to: '+595981123456',
  message: 'Hola, tu inversión fue confirmada exitosamente.',
  previewUrl: true // Opcional, muestra preview de URLs
});

if (result.success) {
  console.log('✅ Mensaje enviado:', result.messageId);
} else {
  console.error('❌ Error:', result.error);
}
```

### Enviar a múltiples usuarios

```typescript
import { sendBulkTextMessage } from '@/app/lib/services/whatsapp';

const phones = ['+595981123456', '+595982234567', '+595983345678'];
const message = 'Nueva campaña disponible. ¡Visita tu dashboard!';

const result = await sendBulkTextMessage(phones, message);

console.log(`📊 Enviados: ${result.successful}/${result.total}`);
console.log(`❌ Fallidos: ${result.failed}`);
```

---

## Plantillas de WhatsApp

Las plantillas son mensajes pre-aprobados por Meta que pueden incluir variables dinámicas.

### Plantilla Simple (Solo Body)

**Plantilla en WhatsApp Manager:**
```
Hola {{1}}, tu inversión de {{2}} plantas en la campaña {{3}} fue confirmada exitosamente.
```

**Código:**
```typescript
import { sendTemplateMessage, createBodyComponent } from '@/app/lib/services/whatsapp';

const result = await sendTemplateMessage({
  to: '+595981123456',
  templateName: 'inversion_confirmada',
  languageCode: 'es',
  components: [
    createBodyComponent(['Juan Pérez', '100', 'Tomate Orgánico'])
  ]
});
```

### Plantilla con Header de Imagen

**Plantilla en WhatsApp Manager:**
- Header: Imagen
- Body: `Nueva campaña disponible: {{1}} en {{2}}. ¡Invierte desde {{3}}!`
- Button: `Ver Campaña` → `https://agrobeat.com/campaign/{{1}}`

**Código:**
```typescript
import { sendTemplateMessage } from '@/app/lib/services/whatsapp';
import { 
  createImageHeaderComponent,
  createBodyComponent,
  createUrlButtonComponent 
} from '@/app/lib/services/whatsapp-helpers';
import { formatCurrency } from '@/lib/utils';

const campaignId = 123;
const campaign = {
  title: 'Tomate Orgánico',
  location: 'Caazapá',
  minInvestment: 500000,
  imageUrl: 'https://agrobeat.com/images/tomate.jpg'
};

const result = await sendTemplateMessage({
  to: '+595981123456',
  templateName: 'nueva_campana',
  languageCode: 'es',
  components: [
    createImageHeaderComponent(campaign.imageUrl),
    createBodyComponent([
      campaign.title,
      campaign.location,
      formatCurrency(campaign.minInvestment)
    ]),
    createUrlButtonComponent(campaignId.toString())
  ]
});
```

### Plantilla con Header de Texto

**Plantilla en WhatsApp Manager:**
- Header: `{{1}}`
- Body: `Hola {{1}}, tu pago de {{2}} fue confirmado. ¡Gracias por invertir!`

**Código:**
```typescript
import { 
  sendTemplateMessage,
  createTextHeaderComponent,
  createBodyComponent
} from '@/app/lib/services/whatsapp';
import { formatCurrency } from '@/lib/utils';

const result = await sendTemplateMessage({
  to: '+595981123456',
  templateName: 'pago_confirmado',
  languageCode: 'es',
  components: [
    createTextHeaderComponent('✅ Pago Confirmado'),
    createBodyComponent([
      'Juan Pérez',
      formatCurrency(5000000)
    ])
  ]
});
```

### Plantilla Compleja (Todo incluido)

**Plantilla en WhatsApp Manager:**
- Header: Imagen
- Body: `Hola {{1}}, tu inversión en {{2}} está en producción. 📊 Plantas: {{3}} 💰 Inversión: {{4}} 📅 Retorno estimado: {{5}}`
- Button 1: `Ver Mi Inversión` → `https://agrobeat.com/tracking/{{1}}`
- Button 2: `Contactar Soporte`

**Código:**
```typescript
import { 
  sendTemplateMessage,
  createImageHeaderComponent,
  createBodyComponent,
  createUrlButtonComponent
} from '@/app/lib/services/whatsapp';
import { formatCurrency } from '@/lib/utils';

const investmentId = 'INV-123';
const investment = {
  userName: 'Juan Pérez',
  campaignTitle: 'Tomate Orgánico',
  plantCount: 100,
  amount: 5000000,
  estimatedReturn: '3 meses',
  imageUrl: 'https://agrobeat.com/images/produccion.jpg'
};

const result = await sendTemplateMessage({
  to: '+595981123456',
  templateName: 'inversion_en_produccion',
  languageCode: 'es',
  components: [
    createImageHeaderComponent(investment.imageUrl),
    createBodyComponent([
      investment.userName,
      investment.campaignTitle,
      investment.plantCount.toString(),
      formatCurrency(investment.amount),
      investment.estimatedReturn
    ]),
    createUrlButtonComponent(investmentId, 0) // Primer botón
  ]
});
```

---

## Casos de Uso Comunes

### 1. Notificar Inversión Confirmada

```typescript
import { sendTemplateMessage, createBodyComponent } from '@/app/lib/services/whatsapp';
import { formatCurrency } from '@/lib/utils';

export async function notifyInvestmentConfirmed(
  phoneNumber: string,
  userName: string,
  campaignTitle: string,
  plantCount: number,
  amount: number
) {
  return await sendTemplateMessage({
    to: phoneNumber,
    templateName: 'inversion_confirmada',
    languageCode: 'es',
    components: [
      createBodyComponent([
        userName,
        plantCount.toString(),
        campaignTitle,
        formatCurrency(amount)
      ])
    ]
  });
}

// Uso
await notifyInvestmentConfirmed(
  '+595981123456',
  'Juan Pérez',
  'Tomate Orgánico',
  100,
  5000000
);
```

### 2. Notificar Pago Pendiente

```typescript
import { sendTextMessage } from '@/app/lib/services/whatsapp';
import { formatCurrency } from '@/lib/utils';

export async function notifyPendingPayment(
  phoneNumber: string,
  userName: string,
  amount: number,
  daysLeft: number
) {
  const message = `Hola ${userName}, recordatorio: tienes un pago pendiente de ${formatCurrency(amount)}. 
  
⏰ Tiempo restante: ${daysLeft} días

Para confirmar tu pago, contacta con nosotros al 0971-781947.

¡Gracias por confiar en Agrobeat! 🌱`;

  return await sendTextMessage({
    to: phoneNumber,
    message,
    previewUrl: false
  });
}
```

### 3. Notificar Nueva Campaña a Todos los Usuarios

```typescript
import { sendTemplateMessage, createBodyComponent } from '@/app/lib/services/whatsapp';
import { formatCurrency } from '@/lib/utils';
import { db } from '@/app/db';

export async function notifyNewCampaignToAll(campaign: {
  title: string;
  location: string;
  minInvestment: number;
  expectedReturn: string;
  closingDays: number;
}) {
  // Obtener usuarios con número de teléfono
  const users = await db.query.users.findMany({
    where: (users, { isNotNull }) => isNotNull(users.phone),
    columns: {
      phone: true,
      name: true,
    }
  });

  const results = await Promise.allSettled(
    users.map(user =>
      sendTemplateMessage({
        to: user.phone!,
        templateName: 'nueva_campana_disponible',
        languageCode: 'es',
        components: [
          createBodyComponent([
            user.name || 'Inversor',
            campaign.title,
            campaign.location,
            formatCurrency(campaign.minInvestment),
            campaign.expectedReturn,
            campaign.closingDays.toString()
          ])
        ]
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  
  return {
    total: users.length,
    successful,
    failed: users.length - successful
  };
}
```

### 4. Recordatorio de Cierre de Campaña

```typescript
import { sendTextMessage } from '@/app/lib/services/whatsapp';

export async function sendCampaignClosingReminder(
  phoneNumber: string,
  userName: string,
  campaignTitle: string,
  hoursLeft: number
) {
  const message = `⏰ ¡ÚLTIMA OPORTUNIDAD!

Hola ${userName}, la campaña "${campaignTitle}" cierra en ${hoursLeft} horas.

🌱 Aún estás a tiempo de invertir
💰 Asegura tu retorno
📊 Plantas disponibles limitadas

¡No te quedes fuera! Reserva ahora: https://agrobeat.com/dashboard`;

  return await sendTextMessage({
    to: phoneNumber,
    message,
    previewUrl: true
  });
}
```

---

## Crear Plantillas en Meta

### Paso a Paso

1. **Accede a Meta Business Manager**
   - Ve a https://business.facebook.com/
   - Selecciona tu cuenta de negocio

2. **Navega a WhatsApp Manager**
   - Menú lateral → WhatsApp
   - Selecciona "Message Templates"

3. **Crea una Nueva Plantilla**
   - Click en "Create Template"
   - Nombre: Usa solo minúsculas y guiones bajos (ej: `inversion_confirmada`)
   - Categoría: Selecciona apropiadamente (Marketing, Utility, Authentication)
   - Idioma: Español

4. **Diseña tu Plantilla**

   **Header (Opcional):**
   - Texto: `Inversión Confirmada` o `{{1}}` para texto dinámico
   - Imagen: Selecciona "Image" y carga un ejemplo
   - Video: Selecciona "Video" para plantillas con video

   **Body (Obligatorio):**
   ```
   Hola {{1}}, tu inversión de {{2}} plantas en la campaña {{3}} fue confirmada exitosamente por un monto de {{4}}.
   ```
   - Usa `{{1}}`, `{{2}}`, etc. para variables
   - Máximo: 1024 caracteres

   **Footer (Opcional):**
   ```
   Agrobeat - Inversiones Agrícolas
   ```

   **Buttons (Opcional):**
   - Quick Reply: Botones de respuesta rápida
   - Call to Action: Botones con URL o teléfono
   - URL Dinámica: `https://agrobeat.com/tracking/{{1}}`

5. **Envía para Aprobación**
   - Revisa que todo esté correcto
   - Click en "Submit"
   - La aprobación puede tomar 24-48 horas

### Ejemplo de Plantilla Completa

**Nombre:** `inversion_confirmada`
**Categoría:** Utility
**Idioma:** Spanish (es)

**Header:**
```
✅ Inversión Confirmada
```

**Body:**
```
Hola {{1}}, 

Tu inversión fue confirmada exitosamente:

🌱 Campaña: {{2}}
📊 Plantas: {{3}}
💰 Monto: {{4}}
📅 Fecha: {{5}}

Puedes seguir el progreso de tu inversión desde tu dashboard.

¡Gracias por confiar en Agrobeat!
```

**Footer:**
```
Agrobeat - Inversiones Agrícolas Inteligentes
```

**Buttons:**
- Button 1: [URL] "Ver Mi Inversión" → `https://agrobeat.com/tracking/{{1}}`
- Button 2: [Quick Reply] "Contactar Soporte"

---

## Tips y Mejores Prácticas

### ✅ Hacer

- Crear plantillas con mensajes claros y concisos
- Usar variables para personalizar los mensajes
- Probar las plantillas antes de enviarlas masivamente
- Mantener un tono profesional y amigable
- Incluir siempre información relevante

### ❌ Evitar

- Enviar spam o mensajes no solicitados
- Usar plantillas para contenido promocional excesivo
- Abusar de emojis o caracteres especiales
- Enviar mensajes muy largos
- Usar información sensible sin encriptar

### 📊 Límites de WhatsApp Business API

- **Mensajes de plantilla:** 1000 destinatarios únicos por día (tier inicial)
- **Mensajes de sesión:** Ilimitados (24 horas después de que el usuario responda)
- **Caracteres:** Máximo 1024 en el body
- **Variables:** Máximo 4 variables por componente

---

## Recursos Adicionales

- [Documentación oficial de WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Guía de plantillas de WhatsApp](https://developers.facebook.com/docs/whatsapp/message-templates)
- [Meta Business Manager](https://business.facebook.com/)

