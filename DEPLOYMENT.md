# Synex Deployment Guide

Complete instructions for deploying Synex to production on Vercel.

## Overview

Synex is built to be deployed on Vercel with zero configuration for the AI components. The platform uses:

- **Frontend**: Next.js 16 with React 19 (deployed globally on Vercel Edge Network)
- **API Routes**: Serverless functions on Vercel (auto-scaled)
- **AI Services**: Vercel AI Gateway (no setup needed) + FAL API for images/videos
- **Database**: Optional (currently using in-memory job store for videos)

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - Your code repository
2. **Vercel Account** - Free tier is sufficient (https://vercel.com)
3. **FAL API Key** - For image and video generation (https://fal.ai/dashboard)
4. **Environment Variables** - FAL_KEY configured

## Deployment Method 1: Vercel CLI (Fastest)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

Navigate to your project directory and run:

```bash
vercel
```

Follow the interactive prompts:
- Link to existing project or create new one
- Confirm project settings
- When prompted for environment variables, add:
  - `FAL_KEY`: Your FAL API key

### Step 3: Verify Deployment

After deployment completes, you'll get a deployment URL. Test it immediately.

## Deployment Method 2: GitHub + Vercel (Recommended for Teams)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Deploy Synex to Vercel"
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Choose "Next.js" as framework (auto-detected)
5. In "Environment Variables" section, add:
   - **Name**: `FAL_KEY`
   - **Value**: Your FAL API key from https://fal.ai/dashboard
6. Click "Deploy"

### Step 3: Monitor Deployment

- Vercel will show deployment progress
- First deployment takes 2-5 minutes
- Subsequent deployments are faster (cache optimization)

### Step 4: Custom Domain (Optional)

After deployment succeeds:

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your custom domain and follow DNS setup instructions

## Environment Variables

### Required for Production

| Variable | Value | Source |
|----------|-------|--------|
| `FAL_KEY` | Your FAL API key | https://fal.ai/dashboard |

### Automatic via Vercel

The following are managed by Vercel and don't need manual configuration:

- **AI Gateway Access** - Automatically enabled
- **OpenAI Models** - Via gateway (no API key needed)
- **Anthropic Models** - Via gateway (no API key needed)
- **Google Models** - Via gateway (no API key needed)

### How to Add Environment Variables in Vercel

1. Go to your project on vercel.com
2. Click "Settings" in the top menu
3. Select "Environment Variables" from the left sidebar
4. Click "Add New"
5. Enter key and value
6. Redeploy with `vercel --prod` to apply changes

## Production Checklist

Before going live, verify:

- [ ] FAL_KEY is set in Vercel environment variables
- [ ] Test chat functionality with web search
- [ ] Test image generation (generates instantly)
- [ ] Test video generation (check status polling)
- [ ] Test on mobile devices (responsive design)
- [ ] Check Web Vitals (LCP < 2.5s recommended)
- [ ] Verify error handling (try invalid inputs)
- [ ] Test with slow network (Chrome DevTools throttling)

## Monitoring & Debugging

### View Logs

In Vercel dashboard:

1. Select your project
2. Click "Deployments" tab
3. Click on the deployment you want to inspect
4. Click "Functions" to see serverless function logs

Alternatively, use Vercel CLI:

```bash
vercel logs
```

### Common Issues & Solutions

#### Issue: "FAL_KEY is undefined"

**Solution**: 
- Verify `FAL_KEY` is added in Vercel project settings
- Redeploy after adding: `vercel --prod`
- Check that you added it to the correct project

#### Issue: "Chat not responding"

**Solution**:
- Verify internet connection (needed for DuckDuckGo search API)
- Check Vercel function logs for errors
- Ensure deployment succeeded (no build errors)

#### Issue: "Image generation returns 404"

**Solution**:
- Verify FAL_KEY is correct and has quota
- Check FAL dashboard (https://fal.ai/dashboard) for usage limits
- Verify the `/api/generate-image` route exists

#### Issue: "Videos never complete"

**Solution**:
- Videos use async processing; polling is normal (2+ minutes typical)
- Check server logs for errors in `/api/generate-video`
- Verify FAL quota isn't exceeded
- Note: In-memory storage means job data is lost on redeploy

### Enable Debug Logging

To see detailed logs during development:

```bash
# Local development with debug output
DEBUG=* npm run dev
```

All console.log statements with `[v0]` prefix will help identify issues.

## Performance Optimization

### Current Architecture

```
User → Vercel Edge Network (Next.js App)
  ├→ Chat API Route → OpenAI/Claude via AI Gateway
  ├→ Image Generation → FAL API
  └→ Video Generation → FAL API (async)
```

### CDN & Caching

- **Static Assets**: Cached globally on Vercel Edge Network
- **API Responses**: Chat responses streamed in real-time (not cached)
- **Images**: Generated on-demand (no caching, FAL handles CDN)

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Largest Contentful Paint) | < 2.5s | UI loads fast |
| FCP (First Contentful Paint) | < 1.2s | Content visible quickly |
| CLS (Cumulative Layout Shift) | < 0.1 | No jumpy layout |
| INP (Interaction to Next Paint) | < 200ms | Responsive to clicks |

Check performance:

```bash
agent-browser vitals "https://your-domain.vercel.app" --json
```

## Scaling & Limits

### Vercel Free Tier Limits

- **Requests**: 100 per day
- **Function Duration**: 10 seconds (serverless functions)
- **Build Time**: 45 minutes total
- **Bandwidth**: Unlimited

### Vercel Pro Tier (Recommended for Production)

- **Requests**: Unlimited
- **Function Duration**: 900 seconds (15 minutes)
- **Build Time**: Unlimited
- **Priority Support**: Yes

### FAL Limits

- **Free Tier**: Limited credits per month
- **Pay-As-You-Go**: Charged per generation
- **Images**: ~$0.001-0.005 per image
- **Videos**: ~$0.01-0.05 per video

Monitor your usage at: https://fal.ai/dashboard

## Rollback & Versioning

### Rollback a Deployment

In Vercel dashboard:

1. Go to "Deployments" tab
2. Find the previous working deployment
3. Click the three dots (⋯) menu
4. Select "Promote to Production"

### Version Control

Always keep meaningful commit messages:

```bash
git commit -m "Add video generation feature"
git commit -m "Fix chat web search"
git commit -m "Update FAL image model to Flux"
```

This helps identify which commit caused issues.

## Advanced Configuration

### Database Integration (Future)

For production with persistence, add a database:

```bash
# Example: Using Neon PostgreSQL
vercel env add DATABASE_URL
# Then add connection logic to app/api routes
```

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// Example: Add to API routes
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests per hour
});
```

### Custom Error Tracking

Add Sentry for error monitoring:

```bash
npm install @sentry/nextjs
vercel env add SENTRY_DSN
```

## Maintenance

### Regular Tasks

- [ ] Monitor FAL usage monthly
- [ ] Check error logs weekly
- [ ] Update dependencies monthly
- [ ] Review performance metrics

### Update Dependencies

```bash
npm outdated  # Check for updates
npm update    # Update minor versions
npm audit fix # Fix security issues
```

After updating:
```bash
npm run build
git commit -m "Update dependencies"
vercel --prod
```

## Security Best Practices

1. **Secrets Management**
   - Never commit `.env.local` to Git
   - Use Vercel Environment Variables for all secrets
   - Rotate FAL_KEY periodically

2. **Input Validation**
   - All API routes validate input (already implemented)
   - Validate prompt length to prevent abuse
   - Sanitize user input before sending to models

3. **CORS & Headers**
   - Currently allows all origins (for development)
   - In production, configure specific origins:
   ```typescript
   // Add to API routes
   headers: {
     'Access-Control-Allow-Origin': 'https://your-domain.com',
   }
   ```

4. **Rate Limiting**
   - Plan: Add per-IP rate limiting
   - Prevent abuse and excessive API costs

## Troubleshooting Deployment

### Build Fails

```bash
# Local test build
npm run build

# Check logs
vercel logs --tail
```

### Environment Variables Not Working

```bash
# Verify they're set
vercel env ls

# Add specific variable
vercel env add FAL_KEY "your-key-here"

# Redeploy
vercel --prod
```

### Function Timeout (Video Generation)

**Issue**: Video generation takes > 10 seconds

**Solution**: 
- This is expected; videos use async processing
- Job status is checked via polling in the UI
- Increase Vercel Pro tier function timeout to 900 seconds

### Memory Issues

**Issue**: Large video files causing errors

**Solution**:
- Upgrade to Vercel Pro for more function memory
- Compress video before returning
- Store videos in external storage (Blob, AWS S3)

## Next Steps

1. **Deploy Now**
   ```bash
   vercel
   ```

2. **Configure Domain** (optional but recommended)
   - Add custom domain in Vercel settings
   - Update DNS records

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor FAL API usage
   - Track error rates

4. **Plan Scaling**
   - Database for chat history
   - Redis for caching
   - Multiple regions for faster response times

5. **Plan Monetization** (optional)
   - Add authentication
   - Usage-based pricing
   - Premium models access

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org
- **Vercel AI SDK**: https://sdk.vercel.ai
- **FAL API Docs**: https://fal.ai/docs
- **GitHub Issues**: Check your repository issues

---

**Your Synex platform is now production-ready!** 🚀
