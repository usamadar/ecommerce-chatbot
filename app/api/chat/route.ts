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
import { messageStore, ChatMessage } from '@/utils/messageStore'

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
    const { messages } = await req.json()
    console.log('Received messages:', messages);
    
    // Clear previous messages and store new ones
    messageStore.clearMessages();
    console.log('Cleared previous messages');
    
    // Store all messages from the conversation
    messages.forEach((message: ChatMessage) => {
      console.log('Processing message:', message);
      if (message.role === 'user' || message.role === 'assistant') {
        messageStore.addMessage(message);
      }
    });

    const systemPrompt = generateSystemPrompt();
    console.log('System Prompt:', systemPrompt);
    
    // Get the response stream
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
      toolChoice: 'auto'
    });

    // Create a text decoder to handle the stream properly
    const decoder = new TextDecoder();

    // Create a transform stream to intercept and store assistant messages
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Log the raw chunk for debugging
        const text = decoder.decode(chunk, { stream: true });
        console.log('Raw chunk:', text);
        
        // Check if it starts with "data: "
        if (text.startsWith('data: ')) {
          try {
            const jsonStr = text.slice(6); // Remove "data: " prefix
            const data = JSON.parse(jsonStr);
            console.log('Parsed data:', data);
            
            // Handle different message formats
            if (data.type === 'text' && data.content) {
              messageStore.addMessage({
                role: 'assistant',
                content: data.content
              });
            } else if (data.role === 'assistant' && data.content) {
              messageStore.addMessage({
                role: 'assistant',
                content: data.content
              });
            } else if (data.message?.content) {
              messageStore.addMessage({
                role: 'assistant',
                content: data.message.content
              });
            }
          } catch (e) {
            console.error('Error parsing data:', e);
          }
        }
        
        // Forward the original chunk
        controller.enqueue(chunk);
      }
    });

    // Pipe through our transform stream
    const responseStream = result.toDataStream().pipeThrough(transformStream);
    return new Response(responseStream);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}
