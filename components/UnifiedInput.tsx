'use client';

import { useState, useRef } from 'react';
import clsx from 'clsx';

export type InputMode = 'chat' | 'image' | 'video';

interface UnifiedInputProps {
  mode: InputMode;
  onSubmit: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function UnifiedInput({
  mode,
  onSubmit,
  isLoading,
  placeholder,
}: UnifiedInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSubmit(input);
    setInput('');
    
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-expand textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'chat':
        return 'from-primary to-secondary';
      case 'image':
        return 'from-secondary to-accent';
      case 'video':
        return 'from-accent to-primary';
      default:
        return 'from-primary to-secondary';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'chat':
        return '💬 Chat';
      case 'image':
        return '🎨 Image';
      case 'video':
        return '🎬 Video';
      default:
        return 'Input';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        {/* Mode indicator */}
        <div
          className={clsx(
            'absolute -top-10 left-0 text-xs font-semibold px-3 py-1 rounded-t-lg',
            'bg-gradient-to-r',
            getModeColor(),
            'text-white'
          )}
        >
          {getModeLabel()}
        </div>

        {/* Input container */}
        <div
          className={clsx(
            'relative flex items-end gap-3 p-4 rounded-2xl',
            'border-2 border-transparent',
            'bg-gradient-to-r',
            getModeColor(),
            'shadow-lg shadow-primary/20',
            'focus-within:border-primary/50 transition-all duration-200'
          )}
        >
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              {
                chat: 'Ask anything... (Shift+Enter for new line)',
                image: 'Describe the image you want to generate...',
                video: 'Describe the video you want to create...',
              }[mode]
            }
            disabled={isLoading}
            className={clsx(
              'flex-1 bg-transparent text-white placeholder-gray-400',
              'outline-none resize-none',
              'text-sm max-h-[120px]',
              'disabled:opacity-50 transition-opacity'
            )}
            rows={1}
            style={{ minHeight: '40px' }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={clsx(
              'flex-shrink-0 px-4 py-2 rounded-lg font-semibold',
              'bg-white/20 hover:bg-white/30 transition-all',
              'text-white text-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-95',
              isLoading && 'animate-pulse'
            )}
          >
            {isLoading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              '✓'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
