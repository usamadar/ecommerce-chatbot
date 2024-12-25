/**
 * This module defines various tools for interacting with the Westwing platform.
 * Each tool has a specific functionality, parameters, and response structure.
 * 
 * Tools:
 * 
 * 1. **lookupOrder**
 *    - Description: Fetch order details from Westwing.
 *    - Parameters:
 *      - `orderId` (string): The order number.
 *      - `email` (string): The email address used for the order.
 *    - Response: Returns order details along with a response control object for UI rendering.
 * 
 * 2. **getWebsiteInfo**
 *    - Description: Get information from Westwing website pages.
 *    - Parameters:
 *      - `topic` (string): The topic to look up information about from the website.
 *    - Response: Returns relevant content based on the topic, along with sources.
 * 
 * 3. **getProductInfo**
 *    - Description: Get product information by product slug.
 *    - Parameters:
 *      - `productId` (string): Product ID or slug.
 *    - Response: Returns product details along with a response control object for UI rendering.
 * 
 * 4. **getReturnPolicy**
 *    - Description: Get return policy information.
 *    - Parameters: None.
 *    - Response: Returns return policy details along with a response control object for UI rendering.
 * 
 * Utility Functions:
 * 
 * - `getToolsInfo`: Returns an array of tool information including name, description, card availability, and topics.
 */

import { z } from 'zod';
import { mockData } from '../mocks';
import { lookupOrder } from '@/utils/shopify';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

export const tools = {
  lookupOrder: {
    description: 'Fetch order details from Westwing',
    hasCard: true,
    topics: ['order tracking', 'order status', 'delivery tracking'],
    parameters: z.object({
      orderId: z.string().describe('The order number'),
      email: z.string().email().describe('The email address used for the order')
    }),
    execute: async ({ orderId, email }: { orderId: string; email: string }) => {
      try {
        const orderDetails = await lookupOrder(orderId, email);
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
    },
  },

  getWebsiteInfo: {
    description: 'Get information from Westwing website pages',
    hasCard: false,
    topics: [
      'website content',
      'product information', 
      'company policies',
      'help articles'
    ],
    parameters: z.object({
      topic: z.string().describe('The topic to look up information about from the website'),
    }),
    execute: async ({ topic }: { topic: string }) => {
      console.log('\n🔍 getWebsiteInfo called with topic:', topic);
      
      try {
        // Generate embedding for the query
        console.log('📊 Generating embedding for query...');
        const queryEmbedding = await embeddings.embedQuery(topic);
        console.log('✅ Embedding generated');

        // Get Pinecone index
        console.log('🔌 Connecting to Pinecone index...');
        const index = pinecone.index(process.env.PINECONE_INDEX!);

        // Perform vector similarity search with more results
        console.log('🔎 Performing vector similarity search...');
        const searchResults = await index.query({
          vector: queryEmbedding,
          topK: 20,
          includeMetadata: true
        });

        // Filter and sort matches by score
        const relevantMatches = searchResults.matches
          .filter(match => match.score && match.score > 0.7)
          .sort((a, b) => (b.score || 0) - (a.score || 0));

        if (relevantMatches.length > 0) {
          // Log most relevant content
          console.log('\n📝 Most relevant content:');
          relevantMatches.slice(0, 3).forEach((match, i) => {
            console.log(`\n--- Match ${i + 1} (score: ${match.score}) ---`);
            console.log(match.metadata?.content?.slice(0, 200) + '...');
          });

          // Combine content from all relevant matches
          const combinedContent = relevantMatches
            .map(match => match.metadata?.content as string)
            .join('\n\n');

          // Get all unique sources
          const sources = [...new Set(
            relevantMatches.map(match => match.metadata?.url as string)
          )];

          console.log('✅ Found relevant content from', sources.length, 'sources');
          return {
            found: true,
            content: combinedContent,
            sources: sources,
            responseControl: {
              type: 'content',
              suppressMessage: true,
              language: 'auto'
            }
          };
        }

        console.log('❌ No relevant content found (scores too low or no matches)');
        return {
          found: false,
          message: {
            en: "I don't have specific information about that topic.",
            de: "Ich habe keine spezifischen Informationen zu diesem Thema."
          }
        };
      } catch (error) {
        console.error('💥 Error in getWebsiteInfo:', error);
        return {
          found: false,
          message: {
            en: "Sorry, I encountered an error while searching for information.",
            de: "Entschuldigung, bei der Suche nach Informationen ist ein Fehler aufgetreten."
          }
        };
      }
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
  }
};

export function getToolsInfo() {
  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    hasCard: tool.hasCard,
    topics: tool.topics
  }));
} 