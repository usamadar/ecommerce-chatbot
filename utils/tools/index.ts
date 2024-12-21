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
    topics: ['website content', 'product information', 'company policies', 'help articles'],
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
          topK: 10,  // Increased from 1 to 10
          includeMetadata: true
        });

        // Filter and sort matches by score
        const relevantMatches = searchResults.matches
          .filter(match => match.score && match.score > 0.7)
          .sort((a, b) => (b.score || 0) - (a.score || 0));

        console.log('📊 Search results:', {
          totalMatches: searchResults.matches.length,
          relevantMatches: relevantMatches.length,
          scores: relevantMatches.map(m => m.score),
          urls: relevantMatches.map(m => m.metadata?.url)
        });
        
        if (relevantMatches.length > 0) {
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
            sources: sources,  // Changed from single source to array of sources
            responseControl: {
              type: 'content',
              suppressMessage: true
            }
          };
        }

        console.log('❌ No relevant content found (scores too low or no matches)');
        return {
          found: false,
          message: "I don't have specific information about that topic."
        };
      } catch (error) {
        console.error('💥 Error in getWebsiteInfo:', error);
        return {
          found: false,
          message: "Sorry, I encountered an error while searching for information."
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