'use client';

import clsx from 'clsx';
import type { InputMode } from './UnifiedInput';

interface ModeTabsProps {
  currentMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

const modes: { value: InputMode; label: string; icon: string }[] = [
  { value: 'chat', label: 'Chat', icon: '💬' },
  { value: 'image', label: 'Image', icon: '🎨' },
  { value: 'video', label: 'Video', icon: '🎬' },
];

export default function ModeTabs({ currentMode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex gap-3 mb-8">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onModeChange(mode.value)}
          className={clsx(
            'flex items-center gap-2 px-5 py-3 rounded-xl',
            'font-semibold text-sm transition-all duration-300',
            'border-2',
            currentMode === mode.value
              ? 'bg-gradient-to-r from-primary to-secondary border-primary/50 text-white shadow-lg shadow-primary/30'
              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
          )}
        >
          <span className="text-xl">{mode.icon}</span>
          <span>{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
