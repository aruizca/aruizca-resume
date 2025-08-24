# AI-Powered Resume Generator

A modern, web-based resume and cover letter generator that transforms LinkedIn export data into professional documents using AI. Built with Node.js + TypeScript + ESM + React, following DDD and Hexagonal Architecture principles.

## 🏗️ Monorepo Structure

This project is organized as a **Turborepo monorepo** with the following packages:

```
aruizca-resume/
├── packages/
│   ├── core/           # Resume and cover letter generation
│   ├── api/            # REST API endpoints
│   └── webapp/         # React-based web interface
├── turbo.json          # Turborepo configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

### 📦 Packages

- **`@aruizca-resume/core`**: Core functionality for resume and cover letter generation
- **`@aruizca-resume/api`**: REST API for resume and cover letter generation
- **`@aruizca-resume/webapp`**: Modern React web interface for user interaction

## Features

- **LinkedIn Integration**: Parse LinkedIn export ZIP files (CSV + HTML)
- **AI-Powered**: Uses OpenAI (ChatGPT 4o) for structured content generation
- **Multiple Formats**: Generates JSON Resume, HTML, and PDF outputs
- **Professional Themes**: Uses `jsonresume-theme-even-crewshin` for rendering
- **Web Interface**: Modern React-based UI for easy interaction
- **REST API**: Programmatic access to all functionality
- **Extensible Architecture**: Ready for future enhancements
- **Monorepo**: Organized with Turborepo for scalability
- **Intelligent Development**: Turborepo watch mode for optimal file watching
- **Hybrid Architecture**: Full-stack server + development server for flexibility

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- OpenAI API key

### Setup
1. **Clone and install**:
```bash
git clone https://github.com/aruizca/aruizca-resume.git
cd aruizca-resume
pnpm install
```

2. **Configure environment**:
```bash
cp env.sample .env
# Edit .env and add your OpenAI API key
```

3. **Start development servers**:
```bash
# Unified development with auto-watching (recommended)
pnpm dev           # Watches core package + runs API + webapp concurrently

# Or start individual services manually
pnpm watch         # Watch core package for changes
pnpm --filter @aruizca-resume/api run dev      # API server on port 3001
pnpm --filter @aruizca-resume/webapp run dev   # Webapp on port 3000
```

4. **Access the application**:
- **Webapp**: http://localhost:3000 (React interface with hot-reload)
- **API Endpoints**: http://localhost:3001/api/* (REST API)
- **Health Check**: http://localhost:3001/health

## 🏗️ Server Architecture

### **Development Setup (Current)**

The project uses a **separated development architecture** for optimal development experience:

```
┌─────────────────────────────────────┐
│         Webapp Dev Server            │
│         Port 3000                    │
│     (Vite + Hot Reload)             │
├─────────────────────────────────────┤
│  React Interface                     │
│  • Hot Module Replacement           │
│  • Fast Refresh                     │
│  • Source Maps                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         API Server                   │
│         Port 3001                    │
│      (Express + TypeScript)         │
├─────────────────────────────────────┤
│  REST API Endpoints                 │
│  • /api/resume/*                    │
│  • /api/cover-letter/*              │
│  • /health                          │
└─────────────────────────────────────┘
```

**Benefits:**
- ✅ **Fast Development**: Webapp has instant hot-reload
- ✅ **API Independence**: API server can restart without affecting webapp
- ✅ **Port Separation**: No conflicts between dev servers
- ✅ **Core Package Watching**: Automatic rebuilding when core changes
- ✅ **Concurrent Execution**: All services run simultaneously

**Usage:**
```bash
# Single command starts everything with auto-watching
pnpm dev

# Access services on their respective ports
# Webapp: http://localhost:3000
# API: http://localhost:3001/api/*
```

## 🚀 Development Workflow

### **Intelligent File Watching with Turborepo**

The project uses **Turborepo's built-in watch mode** for optimal development experience:

```bash
# Single command watches all packages intelligently
pnpm watch
```

**What happens automatically:**
- **Core Package**: Rebuilds library when source files change
- **API Package**: Restarts server when source files change  
- **Webapp Package**: Rebuilds frontend when source files change
- **Dependency Management**: Turborepo handles build order automatically
- **Single Process**: One file watcher instead of multiple processes

**Benefits:**
- ✅ **Faster Development**: No manual rebuilds or restarts
- ✅ **Intelligent Watching**: Only rebuilds what's necessary
- ✅ **Port Management**: Automatic port allocation and conflict resolution
- ✅ **Error Recovery**: Automatic restart on build failures
- ✅ **Resource Efficient**: Single process instead of multiple watchers

### **Development Commands**

| Command | Description | Use Case |
|---------|-------------|----------|
| `pnpm watch` | **Recommended**: Intelligent file watching for all packages | Daily development |
| `pnpm dev` | Parallel development without file watching | One-time builds |
| `pnpm dev:core` | Watch only core package | Library development |
| `pnpm dev:webapp` | Watch only webapp package | Frontend development |
| `pnpm dev:api` | Watch only API package | Backend development |

## 🏗️ Server Architecture

### **Full-Stack vs Development Servers**

The project uses a **hybrid architecture** that provides both development flexibility and production readiness:

#### **Port 3001 - Full-Stack Server (Production Ready)**
```bash
# Start the full-stack server
pnpm dev:api
```

**What it serves:**
- ✅ **API Endpoints**: `/api/resume/*`, `/api/cover-letter/*`
- ✅ **Webapp**: Static files from webapp build
- ✅ **Health Check**: `/health` endpoint
- ✅ **SPA Fallback**: Serves React app for all non-API routes

**Use Cases:**
- **Production deployment** (single server)
- **Full application testing** (API + frontend)
- **Integration testing** (end-to-end workflows)
- **Demo environments** (complete application)

#### **Port 3000 - Development Server (Development Only)**
```bash
# Start the development server
pnpm dev:webapp
```

**What it serves:**
- ✅ **Webapp**: Hot-reload development server
- ✅ **Fast Refresh**: Vite HMR for rapid development
- ✅ **Source Maps**: Full debugging capabilities
- ❌ **No API**: Frontend only

**Use Cases:**
- **Frontend development** (React component work)
- **UI/UX iteration** (rapid visual changes)
- **Hot-reload testing** (immediate feedback)

### **Architecture Benefits**

| Aspect | Full-Stack (3001) | Development (3000) |
|--------|-------------------|-------------------|
| **Completeness** | ✅ API + Webapp | ❌ Webapp only |
| **Development Speed** | ❌ Slower (full rebuild) | ✅ Fast (hot-reload) |
| **Production Ready** | ✅ Yes | ❌ No |
| **API Testing** | ✅ Full access | ❌ No access |
| **Deployment** | ✅ Single server | ❌ Separate servers |

### **Recommended Development Workflow**

1. **Start with full-stack server**:
   ```bash
   pnpm watch  # Watches all packages intelligently
   ```

2. **Access the application**:
   - **Full app**: http://localhost:3001 (API + Webapp)
   - **API testing**: http://localhost:3001/api/*

3. **For frontend-only work**:
   - Use http://localhost:3000 for hot-reload development
   - Use http://localhost:3001 for full integration testing

4. **Production deployment**:
   - Use only port 3001 (full-stack server)
   - Configure reverse proxy if needed

### Web Interface Usage

1. **Resume Generation**:
   - Upload LinkedIn export ZIP file
   - Configure personal information
   - Generate professional resume
   - Export to JSON, HTML, or PDF

2. **Cover Letter Generation**:
   - Upload resume or use generated one
   - Provide job posting URL
   - Generate personalized cover letter
   - Export to HTML or PDF

### API Usage

The REST API provides programmatic access to all functionality:

```bash
# Generate resume from LinkedIn export
curl -X POST http://localhost:3001/api/resume/generate \
  -F "linkedinExport=@linkedin-export.zip"

# Generate cover letter
curl -X POST http://localhost:3001/api/cover-letter/generate \
  -H "Content-Type: application/json" \
  -d '{"resume": {...}, "jobUrl": "https://example.com/job"}'
```

## Development

### Monorepo Commands

```bash
# Build all packages
pnpm build

# Development mode (all packages)
pnpm dev

# Individual package development
pnpm dev:core      # Core package
pnpm dev:webapp    # Web app
pnpm dev:api       # API server

# Testing
pnpm test          # Run all tests
pnpm test:watch    # Watch mode for tests

# Clean build artifacts
pnpm clean
```

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key-here
```