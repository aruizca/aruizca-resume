# System Patterns: Architecture & Design

## Architecture Overview
**Pattern**: Domain-Driven Design (DDD) + Hexagonal Architecture (Ports & Adapters)

### Context Module: `resume-generator`
All core application logic is encapsulated within the `resume-generator` context module, following DDD principles.

## Component Structure

```
src/resume-generator/
├── service/                    # Application Services (Use Cases)
│   ├── GenerateResume.ts      # Main orchestration service
│   └── index.ts
├── domain/                     # Domain Layer
│   ├── model/
│   │   ├── Resume.ts          # Resume entity (JSON Resume schema)
│   │   └── index.ts
│   ├── services/
│   │   ├── ResumeBuilder.ts   # Domain logic for resume construction
│   │   └── index.ts
│   └── index.ts
├── infrastructure/             # Infrastructure Layer
│   ├── parsers/
│   │   ├── LinkedInParser.ts  # LinkedIn data extraction
│   │   └── index.ts
│   ├── langchain/
│   │   ├── PromptRunner.ts    # AI/LLM integration
│   │   └── index.ts
│   ├── output/
│   │   ├── HtmlRenderer.ts    # HTML generation
│   │   ├── PdfExporter.ts     # PDF export
│   │   └── index.ts
│   └── index.ts
├── prompts/
│   └── resumePrompt.txt       # Externalized prompt template
└── index.ts                   # Context module exports
```

## Design Patterns

### 1. Hexagonal Architecture (Ports & Adapters)
- **Domain Layer**: Core business logic (Resume entity, ResumeBuilder service)
- **Application Layer**: Use cases and orchestration (GenerateResume service)
- **Infrastructure Layer**: External concerns (parsers, AI, output renderers)

### 2. Dependency Injection
- Services accept dependencies through constructor injection
- Enables easy testing and component swapping
- Example: `GenerateResume` accepts all dependencies as constructor parameters

### 3. Repository Pattern (Future)
- Current: Direct file system operations
- Future: Abstract interfaces for data persistence
- Enables different storage backends (local files, cloud storage, etc.)

### 4. Strategy Pattern
- Different output formats (HTML, PDF) implement common interface
- Theme selection can be swapped without changing core logic
- AI providers can be swapped (OpenAI, other LLMs)

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

## Key Interfaces

### Resume Entity
```typescript
interface Resume {
  basics: {
    name: string;
    email: string;
    phone?: string;
    location?: Location;
    profiles?: Profile[];
  };
  work: Work[];
  education: Education[];
  skills: Skill[];
  languages?: Language[];
  // ... other JSON Resume fields
}
```

### Service Contracts
- `LinkedInParser.parse(zipPath: string): Promise<ParsedData>`
- `PromptRunner.run(data: ParsedData): Promise<StructuredData>`
- `ResumeBuilder.build(data: StructuredData): Resume`
- `HtmlRenderer.render(resume: Resume): Promise<string>`
- `PdfExporter.export(html: string, outputPath: string): Promise<void>`

## Configuration Management
- **Environment Variables**: API keys, configuration settings
- **External Files**: Prompt templates, theme configurations
- **Runtime Options**: CLI arguments for input/output paths

## Error Handling Strategy
- **Domain Errors**: Business rule violations
- **Infrastructure Errors**: File I/O, API failures
- **Validation Errors**: Invalid input data
- **Graceful Degradation**: Continue processing when possible

## Future Extension Points
1. **UI Layer**: Web interface for resume editing
2. **Cover Letter Generation**: Additional AI-powered content
3. **Multiple Themes**: Theme selection and customization
4. **Cloud Storage**: Remote file storage and sharing
5. **Collaboration**: Multi-user editing and versioning 