import { z } from 'zod';
import { mockData } from '../mocks';
import { lookupOrder } from '@/utils/shopify';
import { knowledgeBase } from '@/utils/knowledge-base';

export const tools = {
  lookupOrder: {
    description: 'Fetch order details from Westwing',
    hasCard: true,
    topics: ['order tracking', 'order status', 'delivery tracking'],
    parameters: z.object({
      orderId: z.string().describe('The unique order ID'),
    }),
    execute: async ({ orderId }: { orderId: string }) => {
      try {
        const orderDetails = await lookupOrder(orderId);
        return {
          ...orderDetails,
          component: 'OrderCard',
          responseControl: {
            type: 'card',
            forcedResponse: "I've found your order information. Let me know if you need any clarification!",
            suppressDetails: true
          }
        };
      } catch (error) {
        return { error: true, message: error.message };
      }
    },
  },

  getWebsiteInfo: {
    description: 'Get information from Westwing website pages',
    hasCard: false,
    topics: knowledgeBase.getUrlMappings().map(m => {
      const urlParts = m.url.split('/').filter(Boolean);
      const topicName = urlParts[urlParts.length - 1].split('#')[0] || urlParts[urlParts.length - 2];
      
      const cleanName = topicName
        .replace(/-/g, ' ')
        .replace('faq', 'sustainability')
        .toLowerCase();

      return {
        name: cleanName,
        description: m.description,
        keywords: m.keywords
      };
    }),
    parameters: z.object({
      topic: z.string().describe('The topic to look up information about from the website'),
    }),
    execute: async ({ topic }: { topic: string }) => {
      const content = await knowledgeBase.getContent(topic);
      if (content) {
        return {
          found: true,
          content: content.content,
          source: content.url,
          responseControl: {
            type: 'content',
            suppressMessage: true
          }
        };
      }
      return {
        found: false,
        message: "I don't have specific information about that topic."
      };
    },
  },

  getProductInfo: {
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
  },

  getReturnPolicy: {
    description: 'Get return policy information',
    hasCard: true,
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
  }
};

export function getToolsInfo() {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    hasCard: tool.hasCard,
    topics: 'topics' in tool ? tool.topics : []
  }));
} 