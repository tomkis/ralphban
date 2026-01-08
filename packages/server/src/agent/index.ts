import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function* createAgent(messages: Message[]) {
  const { textStream } = streamText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    messages,
  });

  for await (const chunk of textStream) {
    yield chunk;
  }
}
