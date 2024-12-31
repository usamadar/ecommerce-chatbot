/**
 * Tools Index Module
 * 
 * This module serves as the central export point for all tools in the Westwing chat system.
 * It imports and exports all available tools, providing a single point of access
 * for the chat interface to interact with various functionalities.
 * 
 * @module ToolsIndex
 * 
 * @example
 * // Example usage:
 * import { tools } from './tools';
 * 
 * // Access a specific tool
 * const orderDetails = await tools.lookupOrder.execute({
 *   orderId: '12345',
 *   email: 'customer@example.com'
 * });
 */

import { lookupOrderTool } from './lookupOrder';
import { getWebsiteInfoTool } from './getWebsiteInfo';
import { getProductInfoTool } from './getProductInfo';
import { getReturnPolicyTool } from './getReturnPolicy';
import { handoffToAgent } from './zendeskTool';

export const tools = {
  handoffToAgent,
  lookupOrder: lookupOrderTool,
  getWebsiteInfo: getWebsiteInfoTool,
  getProductInfo: getProductInfoTool,
  getReturnPolicy: getReturnPolicyTool
};

export function getToolsInfo() {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    hasCard: tool.hasCard,
    topics: tool.topics
  }));
}
