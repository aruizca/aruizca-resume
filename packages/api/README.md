# @aruizca-resume/api

REST API server that serves both the API endpoints and the webapp as a unified full-stack application.

## Architecture

This package provides a single Express server that serves:

1. **API Endpoints** (`/api/*`):
   - `/api/resume/generate` - Resume generation from LinkedIn ZIP files
   - `/api/cover-letter/generate` - Cover letter generation
   - `/health` - Health check endpoint

2. **Static Webapp** (all other routes):
   - Serves the built React webapp from `../webapp/dist`
   - SPA routing support with fallback to `index.html`

## Development

### Unified Development (Recommended)
Builds webapp and runs API server with hot reload:
```bash
pnpm dev:full
```

### API Only Development
Runs just the API server (webapp must be built separately):
```bash
pnpm dev
```

## Production

### Build and Start (Single Command)
```bash
pnpm start:full
```

This will:
1. Build the webapp (`../webapp/dist`)
2. Build the API server TypeScript
3. Start the unified server

### Manual Build Steps
```bash
# Build webapp
pnpm --filter @aruizca-resume/webapp run build

# Build API
pnpm build

# Start server
pnpm start
```

## Deployment

The unified server is perfect for deployment as a single service:

1. **Docker**: Single container serving both API and frontend
2. **Cloud Platforms**: Deploy as one service (Railway, Render, etc.)
3. **VPS**: Single process serving everything

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode ('development' enables CORS for separate frontend)
- `OPENAI_API_KEY` - Required for AI functionality

## URLs

When running on port 3001:
- **Web App**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Resume API**: http://localhost:3001/api/resume/generate
- **Cover Letter API**: http://localhost:3001/api/cover-letter/generate

## Benefits

✅ **Single Deployment Unit**: One server, one port, one process  
✅ **No CORS Issues**: Same origin for API and frontend  
✅ **Simplified Development**: One command to run everything  
✅ **Production Ready**: Optimized for deployment  
✅ **Cost Effective**: Single service hosting  
