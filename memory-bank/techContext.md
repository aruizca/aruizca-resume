# Tech Context: Technologies & Setup

## Technology Stack

### Core Runtime
- **Node.js**: JavaScript runtime (v18+ recommended)
- **TypeScript**: Type-safe JavaScript development
- **ESM**: ES Modules for modern JavaScript
- **esbuild**: Fast TypeScript bundler

### AI & Language Processing
- **OpenAI API**: ChatGPT 4o for content generation
- **LangChain.js**: LLM integration framework
- **Prompt Engineering**: Externalized templates for consistent AI output

### Data Processing
- **adm-zip**: ZIP file extraction
- **papaparse**: CSV parsing for LinkedIn exports
- **cheerio**: HTML parsing for LinkedIn profile data

### Resume Generation
- **JSON Resume**: Standard resume format specification
- **jsonresume-theme-even-crewshin**: Professional HTML theme
- **Playwright**: HTML-to-PDF conversion (implemented)

### Development Tools
- **Git**: Version control
- **npm**: Package management
- **ESLint**: Code linting (planned)
- **Jest**: Testing framework (planned)

## Project Dependencies

### Production Dependencies
```json
{
  "openai": "^4.0.0",           // OpenAI API client
  "papaparse": "^5.0.0",        // CSV parsing
  "jsonresume-theme-even": "^1.0.0", // HTML theme
  "playwright": "^1.54.2"        // PDF generation (implemented)
}
```

### Development Dependencies
```json
{
  "@types/papaparse": "^5.0.0", // TypeScript definitions
  "typescript": "^5.0.0",       // TypeScript compiler
  "esbuild": "^0.19.0"          // TypeScript bundler
}
```

## Environment Setup

### Required Environment Variables
```bash
# .env file
OPENAI_API_KEY=your-openai-api-key-here
```

### Node.js Version
- **Minimum**: Node.js 18+
- **Recommended**: Node.js 20+ (LTS)

### Package Manager
- **Primary**: npm
- **Alternative**: yarn, pnpm

## Build & Development

### Build Process
```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run the application
npm start
```

### Development Workflow
1. **Setup**: Clone repo, install dependencies, set up `.env`
2. **Development**: Edit TypeScript files in `src/`
3. **Build**: Run `npm run build` to compile
4. **Test**: Run `npm start` to execute CLI
5. **Output**: Check `/output` directory for generated files

## File Structure

### Source Code
```
src/
├── resume-generator.ts          # CLI entry point for resume generation
└── resume-generator/            # Main context module
    ├── service/                 # Application services
    ├── domain/                  # Domain models & logic
    ├── infrastructure/          # External integrations
    └── prompts/                # AI prompt templates
```

### Configuration Files
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `.env`: Environment variables (not in repo)
- `env.sample`: Environment template

### Output Directory
- `output/`: Generated resume files (gitignored)
- Files named with date stamps: `resume-yyyymmdd.{json,html,pdf}`

## Development Guidelines

### Code Organization
- **DDD Principles**: Domain logic in domain layer
- **Hexagonal Architecture**: Clear separation of concerns
- **ESM Modules**: Use ES6 import/export syntax
- **TypeScript**: Strict typing for all components

### Import Conventions
- Use `index.ts` files for clean imports
- Avoid `.js` extensions in imports
- Prefer relative imports within context module
- Use absolute imports for external dependencies

### Error Handling
- **API Errors**: Handle OpenAI rate limits and quotas
- **File Errors**: Validate input files and output directories
- **Parsing Errors**: Handle malformed LinkedIn exports
- **Validation Errors**: Ensure JSON Resume compliance

## Testing Strategy (Planned)

### Unit Tests
- **Domain Logic**: ResumeBuilder, Resume entity
- **Infrastructure**: LinkedInParser, PromptRunner
- **Output**: HtmlRenderer, PdfExporter

### Integration Tests
- **End-to-End**: Full pipeline from LinkedIn ZIP to output files
- **API Integration**: OpenAI API response handling
- **File Operations**: Input/output file processing

### Test Tools
- **Jest**: Test framework
- **ts-jest**: TypeScript support
- **Mocking**: OpenAI API, file system operations

## Deployment Considerations

### Local Development
- **Environment**: Local Node.js installation
- **Dependencies**: npm install
- **Configuration**: .env file with API keys

### Future Deployment Options
- **Docker**: Containerized deployment
- **Cloud Functions**: Serverless execution
- **Web UI**: Browser-based interface
- **Desktop App**: Electron packaging

## Performance Considerations

### API Usage
- **OpenAI Quotas**: Monitor API usage and costs
- **Rate Limiting**: Handle API rate limits gracefully
- **Caching**: Consider caching for repeated operations

### File Processing
- **Memory Usage**: Handle large LinkedIn exports
- **Processing Time**: Optimize for reasonable execution times
- **Output Size**: Manage PDF file sizes

## Security Considerations

### API Keys
- **Environment Variables**: Never commit API keys to repo
- **Access Control**: Limit API key permissions
- **Rotation**: Regular key rotation practices

### File Handling
- **Input Validation**: Validate LinkedIn export files
- **Path Traversal**: Prevent directory traversal attacks
- **File Permissions**: Secure output file permissions 