/**
 * Product Information Tool
 * 
 * This tool provides detailed information about products in the Westwing catalog.
 * It retrieves product data from mock data and returns it in a structured format
 * suitable for display in the chat interface.
 * 
 * @module ProductInfoTool
 */

import { z } from 'zod';
import { mockData } from '../mocks';

/**
 * Product Information Tool
 * 
 * @typedef {Object} ProductInfoTool
 * @property {string} description - Tool description
 * @property {boolean} hasCard - Indicates if the tool returns a card component
 * @property {string[]} topics - Relevant topics for this tool
 * @property {z.ZodObject} parameters - Input parameters schema
 * @property {Function} execute - Main execution function
 * 
 * @example
 * // Example usage:
 * const productInfo = await getProductInfoTool.execute({
 *   productId: '12345'
 * });
 */

export const getProductInfoTool = {
  description: 'Get product information by product slug',
  hasCard: true,
  topics: ['product details', 'specifications', 'pricing', 'availability'],
  parameters: z.object({
    productId: z.string().describe('Product ID or slug'),
  }),
  execute: async ({ productId }: { productId: string }) => {
    const product = mockData.products[productId];
    if (!product) return null;
    
    return {
      ...product,
      component: 'ProductCard',
      responseControl: {
        type: 'card',
        forcedResponse: "I've found the product information. Let me know if you need any clarification!",
        suppressDetails: true
      }
    };
  }
};
