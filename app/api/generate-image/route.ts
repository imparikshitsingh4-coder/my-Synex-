import { type NextRequest, NextResponse } from 'next/server';
import * as fal from '@fal-ai/serverless-client';

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY || '',
});

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('[v0] Generating image with prompt:', prompt);

    // Use Flux Schnell model for fast, high-quality image generation
    const result = await fal.subscribe('fal-ai/flux-schnell', {
      input: {
        prompt,
        image_size: 'square_hd', // 1024x1024
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      },
    }) as any;

    console.log('[v0] FAL result:', result);

    // Extract the image URL from the result
    const imageUrl = result.images?.[0]?.url;

    if (!imageUrl) {
      console.error('[v0] No image URL in result:', result);
      throw new Error('No image generated');
    }

    return NextResponse.json({
      success: true,
      url: imageUrl,
      prompt,
    });
  } catch (error) {
    console.error('[v0] Image generation error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate image';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
