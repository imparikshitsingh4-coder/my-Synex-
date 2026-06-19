'use client';

import { useRef, useEffect } from 'react';
import { UIMessage } from 'ai';
import clsx from 'clsx';

interface ChatDisplayProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return '';
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export default function ChatDisplay({ messages, isLoading }: ChatDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-primary mb-2">Start Chatting</h2>
          <p className="text-gray-400">Ask questions, get answers powered by AI</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
      {messages.map((message) => {
        const text = getUIMessageText(message);
        return (
          <div
            key={message.id}
            className={clsx(
              'flex gap-3 animate-in fade-in',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={clsx(
                'max-w-xs px-4 py-3 rounded-lg',
                'text-sm leading-relaxed',
                message.role === 'user'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'bg-white/10 border border-white/20 text-gray-200'
              )}
            >
              {text || (
                <span className="text-gray-400 italic">
                  {message.role === 'assistant' ? 'Processing...' : 'Loading...'}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex gap-1 items-center px-4 py-3 bg-white/10 rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
