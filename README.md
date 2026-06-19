# Synex - Advanced Multi-Modal AI Platform

A sophisticated, production-ready AI platform built with Next.js 16 and the Vercel AI SDK v6. Synex provides a unified interface for real-time text chat with web search, image generation, and video synthesis.

## Features

### 🎯 Core Capabilities

1. **Real-Time Chat with Web Search**
   - Powered by OpenAI GPT-4o-mini via Vercel AI Gateway
   - Integrated web search tool using DuckDuckGo API
   - Streaming responses for optimal UX
   - Automatic tool invocation for current information

2. **Image Generation**
   - Lightweight mock handler for development
   - 1024x1024 image placeholders with prompt-based URLs
   - Simulated generation delays for realistic UX
   - Production-ready: Integrates with Flux Schnell via FAL AI

3. **Video Generation**
   - Async processing with job polling
   - Real-time status updates with progress tracking
   - Mock video handler for development
   - Production-ready: Integrates with Stable Video via FAL AI

### 🎨 UI/UX Features

- **Unified Multi-Modal Input**: Single input bar that adapts to the selected mode
- **Mode Tabs**: Easy switching between Chat, Image, and Video modes
- **Gradient Design System**: Modern, cohesive visual language with cyan, purple, and pink accents
- **Responsive Layout**: Mobile-first design with Tailwind CSS
- **Real-time Feedback**: Loading states, animations, and status indicators

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom React components
- **State Management**: React hooks + AI SDK's useChat

### Backend
- **API Framework**: Next.js Route Handlers
- **AI Models**: Vercel AI Gateway (OpenAI, Anthropic, Google)
- **Image Generation**: Mock handler (development) / FAL AI Flux Schnell (production)
- **Video Generation**: Mock handler (development) / FAL AI Stable Video (production)
- **Search**: DuckDuckGo API (free, no auth required)

### DevOps
- **Deployment**: Vercel
- **Package Manager**: npm
- **Monitoring**: Console logging with [v0] prefix

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- FAL API key (for image/video generation)
- Vercel account (optional, for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd synex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your FAL key:
   ```
   FAL_KEY=your_fal_api_key_here
   ```
   
   Note: The Vercel AI Gateway is automatically configured through Vercel integrations. No additional API keys are needed for OpenAI, Anthropic, or Google models.

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

### Required
- **FAL_KEY**: Your FAL AI API key for image and video generation
  - Get it from: https://fal.ai/dashboard

### Automatic (via Vercel Integration)
- **AI Gateway Access**: Automatically configured through Vercel
- Supports OpenAI, Anthropic, Google, and other providers
- No manual API key management needed

## API Routes

### `/api/chat` (POST)
- **Purpose**: Real-time chat with web search capabilities
- **Input**: `{ messages: UIMessage[] }`
- **Output**: Server-Sent Events stream
- **Features**: Tool calling for web search, streaming responses

### `/api/generate-image` (POST)
- **Purpose**: Generate images using Flux Schnell
- **Input**: `{ prompt: string }`
- **Output**: `{ success: boolean, url: string, prompt: string }`
- **Model**: fal-ai/flux-schnell (1024x1024, high-quality)

### `/api/generate-video` (POST)
- **Purpose**: Start video generation job
- **Input**: `{ prompt: string }`
- **Output**: `{ success: boolean, jobId: string, status: string }`
- **Model**: fal-ai/stable-video (async processing)

### `/api/video-status` (GET)
- **Purpose**: Check video generation status
- **Query**: `?jobId=<jobId>`
- **Output**: `{ jobId, status, url, prompt }`
- **Statuses**: `processing`, `completed`, `failed`

## Project Structure

```
synex/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page
│   ├── globals.css         # Global styles and animations
│   └── api/
│       ├── chat/
│       │   └── route.ts    # Chat API with web search
│       ├── generate-image/
│       │   └── route.ts    # Image generation
│       └── generate-video/
│           └── route.ts    # Video generation
├── components/
│   ├── UnifiedInput.tsx    # Adaptive input bar
│   ├── ModeTabs.tsx        # Mode selector
│   ├── ChatDisplay.tsx     # Chat messages display
│   ├── ImageDisplay.tsx    # Generated images
│   └── VideoDisplay.tsx    # Generated videos
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Usage Guide

### Chat Mode 💬
1. Select the "Chat" tab
2. Type your question in the input bar
3. The AI will search the web if needed and provide current information
4. Use Shift+Enter for multi-line input

### Image Mode 🎨
1. Select the "Image" tab
2. Describe the image you want to generate
3. Click send or press Enter
4. Image appears instantly in the display area

### Video Mode 🎬
1. Select the "Video" tab
2. Describe the video you want to create
3. Click send (video processing starts asynchronously)
4. Monitor the status with real-time updates
5. Download or view when complete

## Performance Optimization

- **Streaming**: Chat responses stream in real-time
- **Async Processing**: Videos generate without blocking the UI
- **Lazy Loading**: Components render only when needed
- **Image Optimization**: Next.js Image component with responsive sizing
- **CSS-in-JS**: Tailwind CSS for zero-runtime overhead

## Error Handling

All API routes include comprehensive error logging with [v0] prefix:
```typescript
console.error('[v0] Chat API error:', error);
```

Errors are gracefully handled with user-friendly messages in the UI.

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial Synex deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com/new
   - Select your GitHub repository
   - Add environment variables (FAL_KEY)
   - Click Deploy

3. **Configure Integrations**
   - Vercel AI Gateway is automatic
   - FAL integration can be added via Vercel dashboard

## Troubleshooting

### Chat not working
- Verify AI Gateway is configured in Vercel project settings
- Check browser console for errors
- Ensure internet connection for web search

### Image generation failing
- Verify FAL_KEY is set in environment variables
- Check FAL dashboard for quota and status
- Review server logs for error details

### Video not generating
- Video processing is asynchronous; check status with polling
- Verify FAL_KEY and sufficient quota
- Long videos may take several minutes

### Build errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Best Practices

1. **Rate Limiting**: Implement rate limiting for production
2. **Caching**: Cache chat responses for common questions
3. **Monitoring**: Set up error tracking (Sentry)
4. **Analytics**: Add usage analytics for insights
5. **Security**: Validate all inputs on the backend

## Future Enhancements

- [ ] Conversation history persistence (database)
- [ ] User authentication and multi-user support
- [ ] Advanced caching with Redis
- [ ] Rate limiting per user
- [ ] Export/share conversations
- [ ] Model selection UI
- [ ] Batch operations
- [ ] Custom system prompts

## Contributing

1. Create a feature branch: `git checkout -b feature/awesome-feature`
2. Commit changes: `git commit -m 'Add awesome feature'`
3. Push to branch: `git push origin feature/awesome-feature`
4. Open a Pull Request

## License

MIT License - Feel free to use this project for personal and commercial use.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review API documentation above

---

**Built with Vercel AI SDK v6** | **Deployed on Vercel** | **Powered by FAL AI**
