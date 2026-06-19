import { type NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

interface VideoJob {
  jobId: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  url?: string;
  createdAt: number;
}

// Store job status in memory (in production, use a database)
const jobStore = new Map<string, VideoJob>();

// Mock video generation - simulates async processing
async function generateVideoMock(jobId: string) {
  const job = jobStore.get(jobId);
  if (!job) return;

  try {
    // Simulate progressive generation
    for (let i = 0; i <= 100; i += 20) {
      job.progress = i;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Use public sample video URL
    const videoUrl = `https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4`;

    job.status = 'completed';
    job.progress = 100;
    job.url = videoUrl;
    job.createdAt = Date.now();

    console.log(`[v0] Video job ${jobId} completed`);
  } catch (error) {
    console.error(`[v0] Video job ${jobId} failed:`, error);
    job.status = 'failed';
    job.progress = 0;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('[v0] Starting video generation with prompt:', prompt);

    const jobId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store initial job status
    jobStore.set(jobId, {
      jobId,
      prompt,
      status: 'processing',
      progress: 0,
      createdAt: Date.now(),
    });

    // Start video generation asynchronously (don't wait for completion)
    generateVideoMock(jobId);

    return NextResponse.json({
      success: true,
      jobId,
      status: 'processing',
      progress: 0,
      message: 'Video generation started. Check status for updates.',
    });
  } catch (error) {
    console.error('[v0] Video generation error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to start video generation';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    const job = jobStore.get(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      url: job.url,
      prompt: job.prompt,
    });
  } catch (error) {
    console.error('[v0] Video status error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to get video status';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
