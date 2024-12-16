import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { tools } from '@/utils/tools'
import { getToolsInfo } from '@/utils/tools/index'

export const runtime = 'edge'


function generateSystemPrompt() {
  const toolsInfo = getToolsInfo();
  const systemPrompt = `You are a helpful Westwing customer service assistant named Delia.

RESPONSE FORMATTING RULES:

1. NEVER use:
   * Asterisks or stars
   * Underscores
   * Square brackets
   * Backticks
   * Bullet points
   * Emojis
   * Special characters
   * Any MArkDown Formatting

2. ONLY use:
   * Plain text
   * Numbers for lists (1., 2., etc.)
   * Basic punctuation (., !, ?)
   * New lines for paragraphs

3. When using tools:
   If response includes responseControl.type = 'card':
   * Use EXACTLY the forcedResponse
   * Do not add extra information
   * The card will display automatically

   For other responses:
   * Use plain text only
   * Use numbered lists
   * Use new lines for structure

Example correct format:
1. Order Tracking: Help with order status
2. Product Information: Details about items

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

  console.log('\n📝 System Prompt:');
  console.log('------------------------');
  console.log(systemPrompt);
  console.log('------------------------\n');

  return systemPrompt;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const systemPrompt = generateSystemPrompt();

    const result = streamText({
      model: openai('gpt-4o-mini'),
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

