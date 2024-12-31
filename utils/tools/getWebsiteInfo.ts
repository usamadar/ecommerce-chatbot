/**
 * Website Information Tool
 * 
 * This tool provides information from Westwing's website pages using vector embeddings
 * and semantic search. It uses OpenAI embeddings and Pinecone vector database to find
 * relevant content based on user queries.
 * 
 * @module WebsiteInfoTool
 */

import { z } from 'zod';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Website Information Tool
 * 
 * @typedef {Object} WebsiteInfoTool
 * @property {string} description - Tool description
 * @property {boolean} hasCard - Indicates if the tool returns a card component
 * @property {string[]} topics - Relevant topics for this tool
 * @property {z.ZodObject} parameters - Input parameters schema
 * @property {Function} execute - Main execution function
 * 
 * @example
 * // Example usage:
 * const websiteInfo = await getWebsiteInfoTool.execute({
 *   topic: 'return policy'
 * });
 */

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY
});

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

export const getWebsiteInfoTool = {
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
  }
};
