'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import ModeTabs from '@/components/ModeTabs';
import UnifiedInput from '@/components/UnifiedInput';
import ChatDisplay from '@/components/ChatDisplay';
import ImageDisplay from '@/components/ImageDisplay';
import VideoDisplay from '@/components/VideoDisplay';
import type { InputMode } from '@/components/UnifiedInput';

interface ImageResult {
  url: string;
  prompt: string;
}

interface VideoResult {
  url: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
}

export default function Home() {
  const [mode, setMode] = useState<InputMode>('chat');
  const [images, setImages] = useState<ImageResult[]>([]);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  // Chat setup with AI SDK
  const { messages, append, isLoading } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const handleModeChange = (newMode: InputMode) => {
    setMode(newMode);
  };

  const handleImageGeneration = async (prompt: string) => {
    setImageLoading(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        setImages((prev) => [
          { url: data.url, prompt },
          ...prev,
        ]);
      } else {
        console.error('Image generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const handleVideoGeneration = async (prompt: string) => {
    setVideoLoading(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        const videoResult: VideoResult = {
          url: data.url || '',
          prompt,
          status: data.status || 'processing',
        };
        setVideos((prev) => [videoResult, ...prev]);

        // Poll for status updates if processing
        if (data.status === 'processing') {
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(
                `/api/video-status?jobId=${data.jobId}`
              );
              const statusData = await statusResponse.json();

              if (
                statusData.status === 'completed' ||
                statusData.status === 'failed'
              ) {
                clearInterval(pollInterval);
                setVideos((prev) =>
                  prev.map((v) =>
                    v.prompt === prompt
                      ? {
                          ...v,
                          status: statusData.status,
                          url: statusData.url || v.url,
                        }
                      : v
                  )
                );
              }
            } catch (error) {
              console.error('Error polling video status:', error);
            }
          }, 2000);
        }
      } else {
        console.error('Video generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setVideoLoading(false);
    }
  };

  const handleSubmit = (text: string) => {
    if (mode === 'chat') {
      append({ role: 'user', content: text });
    } else if (mode === 'image') {
      handleImageGeneration(text);
    } else if (mode === 'video') {
      handleVideoGeneration(text);
    }
  };

  const currentIsLoading =
    mode === 'chat' ? isLoading : mode === 'image' ? imageLoading : videoLoading;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Synex
          </h1>
          <p className="text-gray-400">Advanced Multi-Modal AI Platform</p>
        </div>

        {/* Mode tabs */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom delay-100">
          <ModeTabs currentMode={mode} onModeChange={handleModeChange} />
        </div>

        {/* Display area */}
        <div className="mb-8 bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-8 min-h-[400px] backdrop-blur-sm animate-in fade-in slide-in-from-bottom delay-200">
          {mode === 'chat' && (
            <ChatDisplay messages={messages} isLoading={isLoading} />
          )}
          {mode === 'image' && (
            <ImageDisplay images={images} isLoading={imageLoading} />
          )}
          {mode === 'video' && (
            <VideoDisplay videos={videos} isLoading={videoLoading} />
          )}
        </div>

        {/* Unified input */}
        <div className="animate-in fade-in slide-in-from-bottom delay-300">
          <UnifiedInput
            mode={mode}
            onSubmit={handleSubmit}
            isLoading={currentIsLoading}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500 animate-in fade-in delay-500">
          <p>Powered by Vercel AI SDK & Advanced AI Models</p>
        </div>
      </div>
    </main>
  );
}
