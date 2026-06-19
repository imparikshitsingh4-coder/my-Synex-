# Synex API Documentation

Complete reference for all Synex API endpoints.

## Overview

Synex exposes three main API routes for the core AI capabilities:

1. **Chat API** - Real-time chat with web search
2. **Image Generation API** - Generate images using Flux Schnell
3. **Video Generation API** - Async video synthesis pipeline

## Chat API

### Endpoint

```
POST /api/chat
```

### Description

Real-time chat with integrated web search capabilities. The model automatically decides when to use web search to provide current information.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "What are the latest AI developments in 2024?"
        }
      ]
    }
  ]
}
```

### Response

**Type**: Server-Sent Events (SSE) Stream

**Stream Events:**
```
event: text-delta
data: {"type":"text-delta","delta":"The latest"}

event: text-delta
data: {"type":"text-delta","delta":" AI developments"}

event: text-delta
data: {"type":"text-delta","delta":" in 2024 include..."}

event: message-start
data: {"type":"message-start","role":"assistant"}

event: message-finish
data: {"type":"message-finish","role":"assistant","content":"..."}
```

### Features

- **Streaming**: Responses stream in real-time for better UX
- **Web Search**: Automatic tool calling to search the web
- **Citations**: Sources are included in responses
- **Multi-turn**: Maintains conversation history

### Example Usage

```typescript
// Client-side (using AI SDK)
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const { messages, append } = useChat({
  transport: new DefaultChatTransport({
    api: '/api/chat',
  }),
});

// Send a message
append({ role: 'user', content: 'Hello' });
```

### Error Responses

```json
{
  "error": "Chat failed",
  "status": 500
}
```

## Image Generation API

### Endpoint

```
POST /api/generate-image
```

### Description

Generates images using the Flux Schnell model via FAL AI. Fast, high-quality image generation.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "prompt": "A futuristic city at sunset with neon lights"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "url": "https://v2.fal.ai/files/output-image.jpg",
  "prompt": "A futuristic city at sunset with neon lights"
}
```

**Error (500):**
```json
{
  "success": false,
  "error": "Failed to generate image"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| prompt | string | Yes | Description of the image to generate (max 1000 chars) |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Whether generation succeeded |
| url | string | CDN URL of the generated image (1024x1024) |
| prompt | string | The prompt that was used |
| error | string | Error message if failed |

### Specifications

- **Model**: Flux Schnell
- **Resolution**: 1024x1024 (square HD)
- **Quality**: High
- **Speed**: ~3-5 seconds
- **Safety**: Enabled (filters NSFW content)

### Example Usage

```typescript
const response = await fetch('/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A serene mountain landscape at dawn',
  }),
});

const data = await response.json();
console.log(data.url); // Image URL
```

### Rate Limiting

- **Free Tier (FAL)**: Limited credits per month
- **Pro Tier (FAL)**: Pay-as-you-go (~$0.001-0.005 per image)

Monitor usage at: https://fal.ai/dashboard

## Video Generation API

### Endpoints

#### 1. Start Video Generation

```
POST /api/generate-video
```

**Description**: Start an async video generation job

**Request:**
```json
{
  "prompt": "A rocket launching into space"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "jobId": "video-1718800000000-abc123xyz",
  "status": "processing",
  "message": "Video generation started. Check status for updates."
}
```

#### 2. Check Video Status

```
GET /api/video-status?jobId=<jobId>
```

**Description**: Poll for video generation status

**Response:**
```json
{
  "jobId": "video-1718800000000-abc123xyz",
  "status": "processing",
  "url": null,
  "prompt": "A rocket launching into space"
}
```

When completed:
```json
{
  "jobId": "video-1718800000000-abc123xyz",
  "status": "completed",
  "url": "https://v2.fal.ai/files/output-video.mp4",
  "prompt": "A rocket launching into space"
}
```

### Status States

| Status | Meaning | Next Step |
|--------|---------|-----------|
| `processing` | Video is being generated | Poll again in 2-5 seconds |
| `completed` | Video ready | Download from `url` |
| `failed` | Generation failed | Retry with different prompt |

### Parameters

**POST /api/generate-video:**
- `prompt` (string, required): Description of the video

**GET /api/video-status:**
- `jobId` (query param, required): Job ID from POST response

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| jobId | string | Unique job identifier |
| status | string | Current processing status |
| url | string\|null | Video URL (null while processing) |
| prompt | string | Original prompt |

### Specifications

- **Model**: Stable Video
- **Resolution**: 1024x576
- **Duration**: 4 seconds
- **FPS**: 24
- **Speed**: 2-5 minutes (async processing)

### Example Usage

```typescript
// 1. Start generation
const startResponse = await fetch('/api/generate-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A waves crashing on a beach',
  }),
});

const { jobId } = await startResponse.json();

// 2. Poll for status
const pollStatus = async () => {
  const statusResponse = await fetch(
    `/api/video-status?jobId=${jobId}`
  );
  const status = await statusResponse.json();
  
  if (status.status === 'completed') {
    console.log('Video ready:', status.url);
  } else if (status.status === 'processing') {
    setTimeout(pollStatus, 3000); // Check again in 3 seconds
  }
};

pollStatus();
```

### Implementation Details

- **Async Processing**: Video generation happens in background
- **Job Storage**: Currently in-memory (lost on redeploy)
- **Polling**: Client polls for status updates
- **Timeout**: Jobs older than 1 hour are auto-cleaned

### Production Considerations

For production deployment, consider:

1. **Persistent Storage**: Store job data in database
   ```typescript
   // Instead of Map, use Supabase/Neon
   await db.videoJobs.insert({ jobId, status, prompt });
   ```

2. **Webhook Notifications**: FAL supports webhooks for completion
   ```typescript
   // Configure FAL to notify your endpoint
   await fal.subscribe('fal-ai/stable-video', {
     webhookUrl: 'https://your-domain.com/api/video-webhook',
   });
   ```

3. **External Storage**: Store videos in Vercel Blob or AWS S3
   ```typescript
   // After generation completes
   const videoBlob = await fetch(url).then(r => r.blob());
   await put(`videos/${jobId}.mp4`, videoBlob);
   ```

## Error Handling

All endpoints follow standard HTTP status codes:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Chat response, image generated |
| 202 | Accepted | Video job started |
| 400 | Bad Request | Missing required field |
| 404 | Not Found | Invalid job ID |
| 500 | Server Error | API call failed |

### Common Errors

**Missing Prompt:**
```json
{
  "error": "Prompt is required",
  "status": 400
}
```

**FAL Key Missing:**
```
Error: process.env.FAL_KEY is not set
```
Solution: Add FAL_KEY to Vercel environment variables

**FAL Rate Limited:**
```json
{
  "success": false,
  "error": "Rate limited"
}
```
Solution: Upgrade FAL plan or wait before retrying

## Rate Limiting

### Recommended Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Chat | 30 requests | Per hour per IP |
| Image Gen | 10 requests | Per hour per IP |
| Video Gen | 5 requests | Per hour per IP |

### Implementation

Add rate limiting middleware:

```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 h'),
});

// In API route
const { success } = await ratelimit.limit(req.ip);
if (!success) {
  return new Response('Rate limited', { status: 429 });
}
```

## Authentication

Currently, all endpoints are public. For production, add authentication:

```typescript
// Add to API routes
const token = req.headers.get('authorization');
if (!token || !verifyToken(token)) {
  return new Response('Unauthorized', { status: 401 });
}
```

## CORS

Currently allows all origins. For production:

```typescript
// Add to API responses
headers: {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'POST, GET',
}
```

## Monitoring

### View API Metrics

**In Vercel Dashboard:**
1. Select your project
2. Navigate to "Analytics" tab
3. Filter by endpoint path

### Logging

All API routes include debug logging:

```typescript
console.log('[v0] Chat API called:', messages.length);
console.error('[v0] Chat API error:', error);
```

Access logs in Vercel:
- Go to "Deployments"
- Select deployment
- Click "Functions" tab

### Performance Metrics

Track these metrics:

- **Response Time**: < 1 second (chat), < 5 seconds (images)
- **Error Rate**: < 1%
- **FAL API Usage**: Monitor at https://fal.ai/dashboard

## Testing

### Local Testing

```bash
# Start dev server
npm run dev

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Hello"}]}]}'

# Test image
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A sunset"}'

# Test video
curl -X POST http://localhost:3000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A waterfall"}'

# Check video status
curl "http://localhost:3000/api/video-status?jobId=video-123"
```

### Integration Testing

See `QUICKSTART.md` for end-to-end testing.

## Versioning

Current API Version: **1.0**

Future considerations:
- `/api/v2/chat` for backward compatibility
- Model selection endpoint
- Conversation history persistence

## Support

For issues with the API:

1. Check logs: `vercel logs`
2. Verify environment variables: `vercel env ls`
3. Test locally: `npm run dev`
4. Check FAL status: https://fal.ai/dashboard
5. Review error messages in console

---

**Happy building!** Integrate Synex into your applications using these endpoints.
