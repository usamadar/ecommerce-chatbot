import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { tools } from '@/utils/tools'
import { getToolsInfo } from '@/utils/tools/index'

export const runtime = 'edge'


function generateSystemPrompt() {
  const toolsInfo = getToolsInfo();
  const systemPrompt = `You are a helpful Westwing customer service assistant named Delia. You are fluent in both English and German.

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

${toolsInfo.map(tool => {
  if (tool.name === 'getWebsiteInfo') {
    return `
${tool.name}:
- Description: ${tool.description}
- Has Card: ${tool.hasCard}
- Available Information:
${tool.topics.map(t => `  • ${t.name}: ${t.description}`).join('\n')}`;
  }
  return `
${tool.name}:
- Description: ${tool.description}
- Has Card: ${tool.hasCard}
- Topics: ${tool.topics.join(', ')}`;
}).join('\n')}`;

  return systemPrompt;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const systemPrompt = generateSystemPrompt();
    console.log('System Prompt:', systemPrompt);
    const result = streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
      toolChoice: 'auto'
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

