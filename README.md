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
# Start all services in parallel
pnpm dev

# Or start individual services
pnpm dev:webapp    # React web interface
pnpm dev:api       # REST API server
pnpm dev:core      # Core package in watch mode
```

4. **Access the application**:
- **Web UI**: http://localhost:5173 (React app)
- **API**: http://localhost:3001 (REST endpoints)
- **API Docs**: http://localhost:3001/api-docs (Swagger UI)

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