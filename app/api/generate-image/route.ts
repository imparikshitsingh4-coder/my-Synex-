import { type NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

// Mock image generation using placeholder service
async function generateImageMock(prompt: string): Promise<string> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a deterministic image URL based on prompt hash
  const hash = prompt
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use a public image placeholder service
  const size = '1024x1024';
  const imageUrl = `https://picsum.photos/${size}?random=${hash}`;
  
  return imageUrl;
}

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

    // Use mock image generation
    const imageUrl = await generateImageMock(prompt);

    console.log('[v0] Generated image URL:', imageUrl);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      prompt,
      model: 'flux-schnell-mock',
      generatedAt: new Date().toISOString(),
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
