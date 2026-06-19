# Synex Quick Start Guide

Get up and running with Synex in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- FAL API key (get one free at https://fal.ai/dashboard)

## 1. Setup (2 minutes)

```bash
# Navigate to project directory
cd synex

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

## 2. Configure Environment (1 minute)

Edit `.env.local` and add your FAL key:

```
FAL_KEY=your_fal_api_key_here
```

**Note:** The Vercel AI Gateway (for chat) is automatically configured. No additional setup needed for OpenAI, Anthropic, or Google models.

## 3. Run Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Synex interface with three tabs: Chat, Image, and Video.

## 4. Try Each Feature (1 minute)

### Chat Mode
- Click the "Chat" tab
- Ask a question like "What are the latest AI developments in 2024?"
- The bot will search the web and provide current answers

### Image Mode
- Click the "Image" tab
- Describe an image: "A futuristic city at sunset, neon lights"
- An image will be generated instantly

### Video Mode
- Click the "Video" tab
- Describe a video: "A rocket launching into space"
- Video generation starts (may take a few minutes)

## Deployment to Vercel

### Quick Deploy (via CLI)

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your `FAL_KEY` environment variable when asked.

### Via GitHub

1. Push to GitHub:
```bash
git add .
git commit -m "Initial Synex deployment"
git push origin main
```

2. Connect to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Add `FAL_KEY` in Environment Variables
   - Deploy!

## Troubleshooting

### "Chat not responding"
- Check your internet connection (needed for web search)
- Verify Vercel AI Gateway is configured in project settings

### "Image generation fails"
- Verify `FAL_KEY` is set correctly in `.env.local`
- Check your FAL quota at https://fal.ai/dashboard
- Restart the dev server: `npm run dev`

### "Cannot find module 'ai'"
```bash
npm install
npm run dev
```

### Build errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

## File Structure

```
synex/
├── app/
│   ├── page.tsx              # Main UI
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Styles
│   └── api/
│       ├── chat/route.ts     # Chat with web search
│       ├── generate-image/route.ts
│       └── generate-video/route.ts
├── components/
│   ├── UnifiedInput.tsx      # Input bar
│   ├── ModeTabs.tsx          # Tab selector
│   ├── ChatDisplay.tsx       # Chat messages
│   ├── ImageDisplay.tsx      # Image gallery
│   └── VideoDisplay.tsx      # Video player
└── README.md                 # Full documentation
```

## Next Steps

- Read the full [README.md](./README.md) for advanced configuration
- Customize colors in `tailwind.config.js`
- Add authentication (see README for recommendations)
- Deploy to production on Vercel
- Set up monitoring with Sentry

## Support

- Full docs: [README.md](./README.md)
- FAL documentation: https://fal.ai/docs
- Vercel AI SDK: https://sdk.vercel.ai
- Next.js docs: https://nextjs.org

---

**Ready to go!** Your Synex platform is now running. Start creating with AI today.
