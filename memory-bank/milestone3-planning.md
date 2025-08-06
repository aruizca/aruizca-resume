# Milestone 3: AI-Generated Cover Letter from Job Offer URL

## 🎯 **Goal**
Implement a cover letter generator that uses **Langchain + OpenAI** to produce compelling and professional cover letters tailored to specific job offers.

## 📋 **Requirements**

### **Inputs**
- `.env` property: **URL to a public job offer**
- LinkedIn export data: user's professional profile

### **Processing Steps**
1. **Scrape and parse** the job offer page from the provided URL
2. **Extract relevant job data**:
   - Job title
   - Company name
   - Role description
   - Requirements / responsibilities
3. **Combine** job offer data with:
   - User profile (parsed from LinkedIn export)
   - User's strengths inferred from LinkedIn profile
4. **Prompt engineering** with Langchain:
   - Design a prompt template that merges these elements
   - Ask OpenAI for a personalized, professional cover letter
5. **Output**:
   - Plaintext `.md` or `.txt` file with the generated cover letter
   - PDF version (optional, if resume PDF pipeline can be reused)

## 🏗️ **Architecture Design**

### **Context Module: `cover-letter-generator`**
Following the existing DDD + Hexagonal Architecture pattern:

```
src/main/cover-letter-generator/
├── service/                    # Application Services (Use Cases)
│   ├── GenerateCoverLetter.ts # Main orchestration service
│   └── index.ts               # Barrel exports
├── domain/                     # Domain Layer
│   ├── model/
│   │   ├── JobOffer.ts        # Job offer entity
│   │   ├── CoverLetter.ts     # Cover letter entity
│   │   └── index.ts           # Barrel exports
│   ├── services/
│   │   ├── CoverLetterBuilder.ts # Domain logic
│   │   └── index.ts           # Barrel exports
│   └── index.ts               # Barrel exports
├── infrastructure/             # Infrastructure Layer
│   ├── scrapers/
│   │   ├── JobOfferScraper.ts # Web scraping for job offers
│   │   └── index.ts           # Barrel exports
│   ├── langchain/
│   │   ├── CoverLetterPromptRunner.ts # Langchain integration
│   │   └── index.ts           # Barrel exports
│   ├── output/
│   │   ├── CoverLetterRenderer.ts # Output rendering
│   │   └── index.ts           # Barrel exports
│   └── index.ts               # Barrel exports
└── prompts/
    └── coverLetterPrompt.txt  # Langchain prompt templates
```

### **Key Domain Models**

#### **JobOffer Entity**
```typescript
interface JobOffer {
  url: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location?: string;
  salary?: string;
  scrapedAt: Date;
}
```

#### **CoverLetter Entity**
```typescript
interface CoverLetter {
  jobOffer: JobOffer;
  userProfile: ParsedLinkedInData;
  content: string;
  generatedAt: Date;
  metadata: {
    wordCount: number;
    tone: 'professional' | 'enthusiastic' | 'formal';
    focusAreas: string[];
  };
}
```

## 🔧 **Technical Implementation Plan**

### **Phase 1: Foundation & Architecture** ✅ Complete (Week 1)
1. **Project Structure Setup** ✅
   - ✅ Created `cover-letter-generator` context module
   - ✅ Added Langchain dependencies to `package.json`
   - ✅ Set up barrel exports pattern
   - ✅ Created basic domain models

2. **Integration Points** ✅
   - ✅ Reuse existing `LinkedInParser` for user profile data
   - ✅ Set up integration with existing PDF pipeline for optional PDF output
   - ✅ Reuse existing error handling and validation patterns

### **Phase 2: Web Scraping Infrastructure** 🎯 Next (Week 2)
1. **JobOfferScraper Implementation**
   - Use Playwright (reuse existing PDF infrastructure)
   - Handle different job site formats (LinkedIn, Indeed, company pages)
   - Implement data extraction logic
   - Add error handling and fallback strategies

2. **Data Extraction Challenges**
   - Handle unstructured job descriptions
   - Extract key information reliably
   - Use AI assistance for extraction (Langchain)
   - Create parsers for different job site formats

### **Phase 3: Langchain Integration** (Week 3)
1. **Langchain Setup**
   - Design chains for different operations
   - Implement `CoverLetterPromptRunner`
   - Create configurable prompt templates
   - Add prompt engineering for job matching

2. **Prompt Engineering**
   - Design prompts that combine job data + LinkedIn profile
   - Match user profile to job requirements
   - Highlight relevant strengths
   - Maintain professional tone and structure

### **Phase 4: Cover Letter Generation** (Week 4)
1. **Domain Services**
   - Implement `CoverLetterBuilder` domain service
   - Create `GenerateCoverLetter` application service
   - Design the orchestration flow

2. **Output Generation**
   - Implement markdown/txt output
   - Integrate with existing PDF pipeline
   - Add metadata and formatting

### **Phase 5: Testing & Integration** (Week 5)
1. **Testing Strategy**
   - Unit tests for all components
   - Integration tests with mock job sites
   - Mock Langchain operations
   - Test different job site formats

2. **Documentation & Memory Bank**
   - Update system patterns
   - Document new architecture decisions
   - Update progress tracking

## 🛠️ **Technical Challenges & Solutions**

### **Web Scraping Challenges**
- **Challenge**: Different job sites have different HTML structures
- **Solution**: Create adapters for different job site formats
- **Challenge**: Dynamic content (JavaScript-rendered pages)
- **Solution**: Use Playwright for full browser rendering
- **Challenge**: Rate limiting and anti-bot measures
- **Solution**: Implement retry logic and user-agent rotation

### **Data Extraction Challenges**
- **Challenge**: Job descriptions are often unstructured text
- **Solution**: Use Langchain for intelligent extraction
- **Challenge**: Different companies format job postings differently
- **Solution**: Create multiple extraction strategies

### **Langchain Integration**
- **Challenge**: New dependency and learning curve
- **Solution**: Start with simple chains and iterate
- **Challenge**: Prompt engineering complexity
- **Solution**: Make prompts configurable and testable

## 📊 **Success Metrics**

### **Functional Requirements**
- ✅ Successfully scrape job offer from provided URL
- ✅ Extract key job information (title, company, requirements)
- ✅ Generate personalized cover letter
- ✅ Output in markdown/txt format
- ✅ Optional PDF output

### **Quality Requirements**
- ✅ Cover letter matches job requirements
- ✅ Professional tone and structure
- ✅ Highlights relevant user strengths
- ✅ Appropriate length and formatting

### **Technical Requirements**
- ✅ Follows existing DDD + Hexagonal Architecture
- ✅ Comprehensive error handling
- ✅ Unit and integration tests
- ✅ Documentation and memory bank updates

## 🎯 **Next Steps**

1. **Immediate**: Create detailed implementation plan for Phase 1
2. **Week 1**: Set up project structure and basic domain models
3. **Week 2**: Implement web scraping infrastructure
4. **Week 3**: Integrate Langchain and prompt engineering
5. **Week 4**: Complete cover letter generation pipeline
6. **Week 5**: Testing, documentation, and final integration

## 📝 **Notes**

- **Langchain** should be used to modularize parsing logic, prompt construction, and LLM invocation
- **Prompt templates** should be easily configurable for future tuning or personalization
- **Reuse existing infrastructure** where possible (LinkedInParser, PDF pipeline, error handling)
- **Follow existing patterns** (barrel exports, dependency injection, comprehensive testing)
- **Document all decisions** in memory bank for future reference 