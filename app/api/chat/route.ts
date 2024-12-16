import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { NextRequest } from 'next/server'
import { tools } from '@/utils/tools'
import { getToolsInfo } from '@/utils/tools/index'

export const runtime = 'edge'


function generateSystemPrompt() {
  const toolsInfo = getToolsInfo();
  const systemPrompt = `You are a helpful Westwing customer service assistant named Delia.

Available Tools and Topics:
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
}).join('\n')}

When answering questions:
1. Check ALL available tools and topics that might be relevant
2. Use multiple tools if needed to provide comprehensive information
3. Prioritize official website information using getWebsiteInfo
4. Stay friendly and helpful

When using tools:
• If the tool response includes responseControl.type = 'card':
  - You MUST use EXACTLY the response provided in responseControl.forcedResponse
  - DO NOT add any additional information or details
  - The card will be displayed automatically

• For other tool responses:
  - Format the information clearly
  - Include relevant details from the response
  - Use plain text (no markdown)
`;

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
      toolChoice: 'auto',
    })

    return result.toDataStreamResponse()
  } catch (error) {
    throw error // Let the framework handle the error
  }
}

