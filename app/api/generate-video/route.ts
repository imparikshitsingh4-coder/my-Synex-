import { type NextRequest, NextResponse } from 'next/server';
import * as fal from '@fal-ai/serverless-client';

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

export const maxDuration = 120; // Longer timeout for video generation

interface VideoJob {
  jobId: string;
  prompt: string;
  status: 'processing' | 'completed' | 'failed';
  url?: string;
  createdAt: number;
}

// Store job status in memory (in production, use a database)
const jobStore = new Map<string, VideoJob>();

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('[v0] Starting video generation with prompt:', prompt);

    const jobId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store initial job status
    jobStore.set(jobId, {
      jobId,
      prompt,
      status: 'processing',
      createdAt: Date.now(),
    });

    // Start video generation asynchronously (don't wait for completion)
    generateVideoAsync(jobId, prompt);

    return NextResponse.json({
      success: true,
      jobId,
      status: 'processing',
      message: 'Video generation started. Check status for updates.',
    });
  } catch (error) {
    console.error('[v0] Video generation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to start video generation';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Async function to generate video without blocking the response
async function generateVideoAsync(jobId: string, prompt: string) {
  try {
    console.log(`[v0] Processing video job ${jobId}`);

    // Use a fast video generation model
    // Note: Using image-to-video or text-to-video model available on FAL
    const result = await fal.subscribe('fal-ai/stable-video', {
      input: {
        prompt,
        num_inference_steps: 25,
        fps: 24,
        motion_bucket_id: 127,
        seed: Math.floor(Math.random() * 10000),
      },
    }) as any;

    console.log('[v0] Video generation result:', result);

    const videoUrl = result.video?.url || result.videos?.[0]?.url;

    if (videoUrl) {
      jobStore.set(jobId, {
        jobId,
        prompt,
        status: 'completed',
        url: videoUrl,
        createdAt: Date.now(),
      });
      console.log(`[v0] Video ${jobId} completed: ${videoUrl}`);
    } else {
      throw new Error('No video URL in result');
    }
  } catch (error) {
    console.error(`[v0] Error processing video job ${jobId}:`, error);

    const job = jobStore.get(jobId);
    if (job) {
      jobStore.set(jobId, {
        ...job,
        status: 'failed',
      });
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
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

    // Clean up old jobs (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, value] of jobStore.entries()) {
      if (value.createdAt < oneHourAgo) {
        jobStore.delete(key);
      }
    }

    return NextResponse.json({
      jobId: job.jobId,
      status: job.status,
      url: job.url,
      prompt: job.prompt,
    });
  } catch (error) {
    console.error('[v0] Video status check error:', error);

    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
