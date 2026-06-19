import { streamText, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

// Simple web search implementation using free API
async function performWebSearch(query: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`,
      {
        headers: {
          'User-Agent': 'Synex-AI-Platform/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json() as any;

    // Extract relevant results
    const results = data.Results?.slice(0, 3) || [];
    if (results.length === 0) {
      return 'No search results found for this query.';
    }

    const formatted = results
      .map(
        (result: any, i: number) =>
          `${i + 1}. ${result.Title}\n${result.FirstURL}\n${result.Text}`
      )
      .join('\n\n');

    return `Search results for "${query}":\n\n${formatted}`;
  } catch (error) {
    console.error('[v0] Web search error:', error);
    return 'Unable to perform web search at this time.';
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert UI messages to model messages
    const convertedMessages = await convertToModelMessages(messages);

    // Create the chat response with tool calling
    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: `You are Synex, an advanced multi-modal AI assistant. You have access to real-time web search capabilities. 
When users ask questions that would benefit from current information, use the web_search tool to find up-to-date results.
Always cite your sources when using web search results.
Provide clear, concise, and helpful responses.
When discussing technical topics, be thorough but accessible.`,
      messages: convertedMessages,
      tools: {
        web_search: tool({
          description:
            'Search the web for current information, news, or facts. Use this when you need up-to-date information or specific details.',
          parameters: z.object({
            query: z.string().describe('The search query to perform'),
          }),
          execute: async (input: { query: string }) => {
            console.log('[v0] Executing web search for:', input.query);
            const results = await performWebSearch(input.query);
            return results;
          },
        } as any),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[v0] Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
