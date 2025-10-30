/**
 * Helpers para construir componentes de plantillas de WhatsApp
 * 
 * Estas funciones facilitan la creación de componentes para templates de WhatsApp
 * sin necesidad de construir manualmente la estructura completa.
 */

import type { TemplateParameter, TemplateComponent } from './whatsapp';

/**
 * Helper para crear parámetros de texto de forma más simple
 * 
 * @param values - Array de strings que serán los valores de los parámetros
 * @returns Array de TemplateParameter
 * 
 * @example
 * ```typescript
 * const params = createTextParameters(['Juan', '100', 'Tomate']);
 * // Equivalente a:
 * // [
 * //   { type: 'text', text: 'Juan' },
 * //   { type: 'text', text: '100' },
 * //   { type: 'text', text: 'Tomate' }
 * // ]
 * ```
 */
export function createTextParameters(values: string[]): TemplateParameter[] {
  return values.map(value => ({
    type: 'text' as const,
    text: value,
  }));
}

/**
 * Helper para crear parámetros de texto con nombres
 * 
 * @param params - Objeto con pares key-value donde key es el parameter_name y value es el texto
 * @returns Array de TemplateParameter con parameter_name
 * 
 * @example
 * ```typescript
 * const params = createNamedTextParameters({
 *   name: 'Juan',
 *   crop: 'Tomate'
 * });
 * // Equivalente a:
 * // [
 * //   { type: 'text', text: 'Juan', parameter_name: 'name' },
 * //   { type: 'text', text: 'Tomate', parameter_name: 'crop' }
 * // ]
 * ```
 */
export function createNamedTextParameters(params: Record<string, string>): TemplateParameter[] {
  return Object.entries(params).map(([paramName, value]) => ({
    type: 'text' as const,
    text: value,
    parameter_name: paramName,
  }));
}

/**
 * Helper para crear un componente body con parámetros de texto
 * 
 * @param values - Array de strings que serán los valores de los parámetros
 * @returns TemplateComponent para el body
 * 
 * @example
 * ```typescript
 * const bodyComponent = createBodyComponent(['Juan', '100']);
 * ```
 */
export function createBodyComponent(values: string[]): TemplateComponent {
  return {
    type: 'body',
    parameters: createTextParameters(values),
  };
}

/**
 * Helper para crear un componente body con parámetros nombrados
 * 
 * @param params - Objeto con pares key-value donde key es el parameter_name
 * @returns TemplateComponent para el body
 * 
 * @example
 * ```typescript
 * const bodyComponent = createNamedBodyComponent({
 *   name: 'Juan',
 *   crop: 'Tomate'
 * });
 * ```
 */
export function createNamedBodyComponent(params: Record<string, string>): TemplateComponent {
  return {
    type: 'body',
    parameters: createNamedTextParameters(params),
  };
}

/**
 * Helper para crear un componente header con una imagen
 * 
 * @param imageUrl - URL de la imagen
 * @returns TemplateComponent para el header
 * 
 * @example
 * ```typescript
 * const headerComponent = createImageHeaderComponent('https://ejemplo.com/imagen.jpg');
 * ```
 */
export function createImageHeaderComponent(imageUrl: string): TemplateComponent {
  return {
    type: 'header',
    parameters: [
      {
        type: 'image',
        image: { link: imageUrl },
      },
    ],
  };
}

/**
 * Helper para crear un componente header con texto
 * 
 * @param text - Texto del header
 * @returns TemplateComponent para el header
 * 
 * @example
 * ```typescript
 * const headerComponent = createTextHeaderComponent('Nueva Campaña');
 * ```
 */
export function createTextHeaderComponent(text: string): TemplateComponent {
  return {
    type: 'header',
    parameters: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

/**
 * Helper para crear un componente button con URL dinámica
 * 
 * @param urlSuffix - Sufijo dinámico de la URL (ej: ID de campaña)
 * @param buttonIndex - Índice del botón (default: 0)
 * @returns TemplateComponent para el botón
 * 
 * @example
 * ```typescript
 * // Si tu plantilla tiene botón con URL: https://tudominio.com/campaign/{{1}}
 * const buttonComponent = createUrlButtonComponent('123');
 * ```
 */
export function createUrlButtonComponent(urlSuffix: string, buttonIndex: number = 0): TemplateComponent {
  return {
    type: 'button',
    sub_type: 'url',
    index: buttonIndex,
    parameters: [
      {
        type: 'text',
        text: urlSuffix,
      },
    ],
  };
}

