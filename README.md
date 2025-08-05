# AI-Powered Resume Generator

A local-first, CLI-based resume generator that transforms LinkedIn export data into professional resumes using AI. Built with Node.js + TypeScript + ESM, following DDD and Hexagonal Architecture principles.

## Features

- **LinkedIn Integration**: Parse LinkedIn export ZIP files (CSV + HTML)
- **AI-Powered**: Uses OpenAI (ChatGPT 4o) for structured content generation
- **Multiple Formats**: Generates JSON Resume, HTML, and PDF outputs
- **Professional Themes**: Uses `jsonresume-theme-even-crewshin` for rendering
- **Date-Stamped Output**: Files named with generation date (`resume-yyyymmdd.*`)
- **Extensible Architecture**: Ready for future UI and cover letter features

## Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key

### Setup
1. **Clone and install**:
```bash
git clone https://github.com/aruizca/aruizca-resume.git
cd aruizca-resume
npm install
```

2. **Configure environment**:
```bash
cp env.sample .env
# Edit .env and add your OpenAI API key
```

3. **Prepare LinkedIn export**:
- Export your data from LinkedIn (Settings → Data Privacy → Get a copy)
- Extract the ZIP to `linkedin-export/extracted/`

4. **Generate resume**:
```bash
npm run build
npm start
```

The script will automatically use the newest LinkedIn export in the `linkedin-export/` folder. You can also specify a custom path:
```bash
npm start /path/to/custom/extracted/directory
```

5. **Generate PDF from existing HTML** (faster alternative):
```bash
npm run pdf output/resume-20250805.html
```

This skips LinkedIn parsing and AI generation, using only the PDF export pipeline.

Output files will be created in the `output/` directory with date stamps.

## Project Memory System

This project uses a comprehensive memory bank system to maintain context across development sessions. The `memory-bank/` directory contains:

- **projectbrief.md**: Project goals, requirements, and scope
- **productContext.md**: Purpose, user stories, and problems addressed
- **activeContext.md**: Current work, open threads, decisions, and next steps
- **systemPatterns.md**: Architecture, component relationships, and design patterns
- **techContext.md**: Technologies, setup guides, and dependencies
- **progress.md**: What's working, what's left, and known issues

### For Contributors
- Always reference memory bank files for complete project context
- Update relevant memory files when making significant changes
- Follow the architecture patterns documented in `systemPatterns.md`
- Check `activeContext.md` for current development status

## Architecture

Built with Domain-Driven Design (DDD) + Hexagonal Architecture:

```
src/resume-generator/
├── service/                    # Application Services (Use Cases)
│   └── GenerateResume.ts      # Main orchestration service
├── domain/                     # Domain Layer
│   ├── model/Resume.ts        # Resume entity (JSON Resume schema)
│   └── services/ResumeBuilder.ts # Domain logic
├── infrastructure/             # Infrastructure Layer
│   ├── parsers/LinkedInParser.ts # LinkedIn data extraction
│   ├── langchain/PromptRunner.ts # AI/LLM integration
│   └── output/                # Output renderers
│       ├── HtmlRenderer.ts    # HTML generation
│       └── PdfExporter.ts     # PDF export
└── prompts/resumePrompt.txt   # AI prompt templates
```

## Data Flow

```
LinkedIn ZIP → LinkedInParser → ParsedData
                                    ↓
PromptRunner ← PromptTemplate ← OpenAI API
                                    ↓
ResumeBuilder → JSON Resume → HtmlRenderer → HTML
                                    ↓
PdfExporter → PDF
```

## Development

### Build & Run
```bash
npm run build    # Compile TypeScript
npm start        # Full pipeline (LinkedIn → AI → HTML → PDF)
npm run pdf      # PDF only (HTML → PDF, much faster)
```

### Environment Variables
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

### Output Files
- `output/resume-yyyymmdd.json` - JSON Resume format
- `output/resume-yyyymmdd.html` - Rendered HTML
- `output/resume-yyyymmdd.pdf` - PDF export

## Current Status

### ✅ Completed
- Project setup with DDD + Hexagonal Architecture
- OpenAI API integration (ChatGPT 4o)
- HTML rendering with JSON Resume theme
- Date-stamped file naming
- AI-powered skill categorization

### 🔄 In Progress
- LinkedIn parser enhancement (needs real CSV structure analysis)
- PDF export implementation (Puppeteer/Playwright integration)

### 📋 Planned
- CLI improvements (options, help, verbose output)
- Comprehensive error handling
- Unit and integration testing
- Web UI and cover letter features

## Dependencies

### Core
- **Node.js + TypeScript + ESM**: Modern JavaScript development
- **esbuild**: Fast TypeScript bundler
- **OpenAI API**: ChatGPT 4o for content generation

### Data Processing
- **papaparse**: CSV parsing for LinkedIn exports
- **adm-zip**: ZIP file extraction
- **cheerio**: HTML parsing

### Output Generation
- **jsonresume-theme-even-crewshin**: Professional HTML theme
- **Puppeteer/Playwright**: PDF export (planned)

## License

MIT 