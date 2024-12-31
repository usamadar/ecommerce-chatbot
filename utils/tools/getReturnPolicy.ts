/**
 * Return Policy Tool
 * 
 * This tool provides information about Westwing's return policy.
 * It retrieves return policy data from mock data and returns it in a structured format
 * suitable for display in the chat interface.
 * 
 * @module ReturnPolicyTool
 */

import { z } from 'zod';
import { mockData } from '../mocks';

/**
 * Return Policy Tool
 * 
 * @typedef {Object} ReturnPolicyTool
 * @property {string} description - Tool description
 * @property {boolean} hasCard - Indicates if the tool returns a card component
 * @property {string[]} topics - Relevant topics for this tool
 * @property {z.ZodObject} parameters - Input parameters schema
 * @property {Function} execute - Main execution function
 * 
 * @example
 * // Example usage:
 * const returnPolicy = await getReturnPolicyTool.execute();
 */

export const getReturnPolicyTool = {
  description: 'Get return policy information',
  hasCard: true,
  topics: ['returns', 'refunds', 'shipping returns', 'return policy'],
  parameters: z.object({}),
  execute: async () => {
    return {
      ...mockData.returns,
      component: 'ReturnPolicyCard',
      responseControl: {
        type: 'card',
        forcedResponse: "I've found our return policy information. Let me know if you need help understanding any part of it!",
        suppressDetails: true
      }
    };
  }
};
