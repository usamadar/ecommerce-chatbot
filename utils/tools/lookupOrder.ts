/**
 * Order Lookup Tool
 * 
 * This tool provides order details from Westwing's order system.
 * It interfaces with Shopify's API to retrieve order information
 * and returns it in a structured format suitable for display in the chat interface.
 * 
 * @module LookupOrderTool
 */

import { z } from 'zod';
import { lookupOrder as shopifyLookupOrder } from '@/utils/shopify';

/**
 * Order Lookup Tool
 * 
 * @typedef {Object} LookupOrderTool
 * @property {string} description - Tool description
 * @property {boolean} hasCard - Indicates if the tool returns a card component
 * @property {string[]} topics - Relevant topics for this tool
 * @property {z.ZodObject} parameters - Input parameters schema
 * @property {Function} execute - Main execution function
 * 
 * @example
 * // Example usage:
 * const orderDetails = await lookupOrderTool.execute({
 *   orderId: '12345',
 *   email: 'customer@example.com'
 * });
 */

export const lookupOrderTool = {
  description: 'Fetch order details from Westwing',
  hasCard: true,
  topics: ['order tracking', 'order status', 'delivery tracking'],
  parameters: z.object({
    orderId: z.string().describe('The order number'),
    email: z.string().email().describe('The email address used for the order')
  }),
  execute: async ({ orderId, email }: { orderId: string; email: string }) => {
    try {
      const orderDetails = await shopifyLookupOrder(orderId, email);
      return {
        ...orderDetails,
        component: 'OrderCard',
        responseControl: {
          type: 'card',
          forcedResponse: {
            en: "I've found your order information. Let me know if you need any clarification!",
            de: "Ich habe Ihre Bestellinformationen gefunden. Lassen Sie mich wissen, wenn Sie weitere Klärung benötigen!"
          },
          suppressDetails: true
        }
      };
    } catch (error) {
      return { 
        error: true, 
        message: {
          en: (error as Error).message ?? 'An unknown error occurred',
          de: (error as Error).message ?? 'Ein unbekannter Fehler ist aufgetreten'
        }
      };
    }
  }
};
