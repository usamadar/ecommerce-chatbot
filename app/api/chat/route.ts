/**
 * This module handles the chat functionality for the Westwing customer service assistant named Delia.
 * It utilizes the OpenAI API to generate responses based on user messages and available tools.
 * 
 * Dependencies:
 * - openai: The OpenAI SDK for interacting with the GPT model.
 * - streamText: A utility for streaming text responses.
 * - NextRequest: A type from Next.js for handling incoming requests.
 * - tools: A collection of available tools for the assistant to use.
 * - getToolsInfo: A utility function to retrieve information about the available tools.
 * 
 * Runtime:
 * - The module is set to run in an edge environment for optimized performance.
 * 
 * Functions:
 * 
 * generateSystemPrompt:
 * - Generates a system prompt for the assistant, outlining its role, language capabilities, and guidelines for responding to user queries.
 * - The prompt includes instructions on how to handle tool responses and language translation.
 * 
 * POST:
 * - Handles incoming POST requests containing user messages.
 * - Generates a system prompt and logs it for debugging purposes.
 * - Uses the streamText function to process the messages and generate a response from the assistant.
 * - Returns the response as a data stream.
 * 
 * Error Handling:
 * - Catches and logs any errors that occur during the processing of requests.
 */
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { tools } from '@/utils/tools'
import { getToolsInfo } from '@/utils/tools/index'
import { messageStore } from '@/utils/messageStore'

export const runtime = 'edge'


function generateSystemPrompt() {
  const toolsInfo = getToolsInfo();
  const systemPrompt = `You are a helpful Westwing customer service assistant named Ava. You are fluent in both English and German.

When answering questions:
1. Check ALL available tools and topics that might be relevant
2. Use multiple tools if needed to provide comprehensive information
3. Prioritize official website information using getWebsiteInfo
4. Stay friendly and helpful
5. Be concise and clear
6. Respond in the same language as the user's question (English or German)
7. If the user writes in German, translate any English content from tools into German before responding

Language Guidelines:
- If the user writes in German, respond in German
- If the user writes in English, respond in English
- For German responses, maintain a friendly tone using "Sie" for formality
- Translate tool responses and content into the user's language

When using tools:
If response includes responseControl.type = 'card':
- Use EXACTLY the forcedResponse (translate to German if user wrote in German)
- Do not add extra information
- The card will display automatically

Special Instructions for Human Agent Handoff:
1. When a user requests to speak with a human agent or when you need to transfer to human support:
   - ALWAYS ask for their email address first even if it was provided before. 
   - ALWAYS ask for a brief reason for needing human support if not provided
   - Only proceed with the handoff after collecting both pieces of information
   - If the user provides only one piece of information, politely ask for the missing information
2. Example responses for collecting information:
   English:
   - "I'll help transfer you to a human agent. Could you please provide:
     1. Your email address for follow-up
     2. A brief description of your concern"
   German:
   - "Ich helfe Ihnen gerne bei der Weiterleitung an einen Mitarbeiter. Bitte teilen Sie mir mit:
     1. Ihre E-Mail-Adresse für die weitere Kommunikation
     2. Eine kurze Beschreibung Ihres Anliegens"

${toolsInfo.map(tool => `
${tool.name}:
- Description: ${tool.description}
- Has Card: ${tool.hasCard}
- Topics: ${tool.topics.join(', ')}`
).join('\n')}`;

  return systemPrompt;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const systemPrompt = generateSystemPrompt();
    //console.log('System Prompt:', systemPrompt);
    
    // Get the response stream
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
      toolChoice: 'auto',
      async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
        // Store both the user message and assistant's response
        await messageStore.saveChat({ 
          text, 
          toolCalls, 
          toolResults,
          messages,
          usage,
          finishReason
        });
      },
    });
    return new Response(result.toDataStream());
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
