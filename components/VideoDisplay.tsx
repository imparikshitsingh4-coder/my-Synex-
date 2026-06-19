'use client';

interface VideoResult {
  url: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
}

interface VideoDisplayProps {
  videos: VideoResult[];
  isLoading: boolean;
}

export default function VideoDisplay({ videos, isLoading }: VideoDisplayProps) {
  if (videos.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-accent mb-2">Generate Videos</h2>
          <p className="text-gray-400">Transform ideas into dynamic video content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
      {videos.map((video, idx) => (
        <div
          key={idx}
          className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-in fade-in"
        >
          <div className="relative w-full h-64 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            {video.status === 'completed' ? (
              <video
                src={video.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-full animate-spin opacity-50" />
                  <div className="absolute inset-1 bg-background rounded-full" />
                </div>
                <p className="text-sm text-gray-400">
                  {video.status === 'processing' ? 'Processing...' : 'Failed'}
                </p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-white/10">
            <p className="text-xs text-gray-300 line-clamp-2">{video.prompt}</p>
            <p className="text-xs text-accent mt-1 font-semibold">
              {video.status === 'processing'
                ? 'Status: Processing'
                : video.status === 'completed'
                  ? 'Status: Ready'
                  : 'Status: Failed'}
            </p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary rounded-full animate-spin opacity-50" />
              <div className="absolute inset-1 bg-background rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center text-2xl">🎬</div>
            </div>
            <p className="text-sm text-gray-400">Generating your video...</p>
          </div>
        </div>
      )}
    </div>
  );
}
