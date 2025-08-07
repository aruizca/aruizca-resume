# Cover Letter Generation Implementation

## 🎯 **Goal**
Implement a cover letter generator that uses **Langchain + OpenAI** to produce compelling and professional cover letters tailored to specific job offers.

## 📋 **Requirements**

### **Inputs**
- JSON resume file path
- Job posting URL

### **Processing Steps**
1. **Scrape and parse** the job offer page from the provided URL
2. **Extract relevant job data**:
   - Job title
   - Company name
   - Role description
   - Requirements / responsibilities
3. **Combine** job offer data with:
   - JSON resume data
   - User's strengths inferred from resume
4. **Prompt engineering** with Langchain:
   - Design a prompt template that merges these elements
   - Ask OpenAI for a personalized, professional cover letter
5. **Output**:
   - Markdown file with the generated cover letter

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

## 🔧 **Technical Implementation**

### **Foundation & Architecture** ✅ Complete
1. **Project Structure Setup** ✅
   - ✅ Created `cover-letter-generator` context module
   - ✅ Added Langchain dependencies to `package.json`
   - ✅ Set up barrel exports pattern
   - ✅ Created basic domain models

2. **Integration Points** ✅
   - ✅ Reuse existing `LinkedInParser` for user profile data
   - ✅ Set up integration with existing PDF pipeline for optional PDF output
   - ✅ Reuse existing error handling and validation patterns

### **HTML Fetching & LLM Extraction** ✅ Complete
1. **JobOfferScraper Implementation** ✅
   - ✅ Simple HTTP client to fetch raw HTML from job URLs
   - ✅ Pass raw HTML to LLM for intelligent extraction
   - ✅ Use Langchain for structured data extraction
   - ✅ Handle different job site formats through LLM understanding

2. **LLM-Based Data Extraction** ✅
   - ✅ Design prompts for job information extraction
   - ✅ Extract key information: title, company, description, requirements
   - ✅ Use structured output (JSON) from LLM
   - ✅ Handle edge cases and extraction failures

3. **Integration with Existing Infrastructure** ✅
   - ✅ Reuse existing error handling patterns
   - ✅ Integrate with Langchain utilities
   - ✅ Add validation for extracted data
   - ✅ Test with real job postings (Cabify example)

### **Enhanced Langchain Integration & JSON-Based Processing** ✅ Complete
1. **JSON-Based Processing** ✅
   - ✅ Created `coverLetterJsonPrompt.txt` for JSON inputs
   - ✅ Updated `CoverLetterPromptRunner` to accept JSON inputs
   - ✅ Implemented `runWithJson()` method for direct JSON processing
   - ✅ Added JSON resume loading functionality

2. **Enhanced Prompt Engineering** ✅
   - ✅ Structured JSON inputs (job posting + resume data)
   - ✅ Markdown output format for clean formatting
   - ✅ Improved job-candidate matching through JSON analysis
   - ✅ Better error handling for JSON parsing

3. **Integration with Existing Infrastructure** ✅
   - ✅ Reuse existing error handling patterns
   - ✅ Integrate with Langchain utilities
   - ✅ Add validation for JSON inputs
   - ✅ Test with real job postings and resume data

### **Cover Letter Script** ✅ Complete
1. **Standalone Script** ✅
   - ✅ Created `cover-letter-generator.ts` script
   - ✅ Added parameter validation for JSON resume path and job URL
   - ✅ Implemented comprehensive error handling
   - ✅ Added user-friendly usage instructions

2. **Build System Integration** ✅
   - ✅ Added `npm run cover-letter` script to package.json
   - ✅ Updated build process to include cover letter generator
   - ✅ Integrated with existing environment validation

3. **Testing & Documentation** ✅
   - ✅ Added comprehensive unit tests
   - ✅ Updated README with usage examples
   - ✅ Added error scenario handling

## 🛠️ **Technical Challenges & Solutions**

### **HTML Fetching & LLM Extraction Challenges**
- **Challenge**: Different job sites have different HTML structures
- **Solution**: Let LLM handle structure variations through natural language understanding
- **Challenge**: Large HTML content that might exceed token limits
- **Solution**: Implement content truncation and focus on relevant sections
- **Challenge**: Rate limiting and access restrictions
- **Solution**: Implement retry logic and user-agent headers

### **LLM-Based Data Extraction Challenges**
- **Challenge**: Ensuring consistent extraction across different job formats
- **Solution**: Design robust prompts with clear output schemas
- **Challenge**: Handling edge cases and malformed HTML
- **Solution**: Implement validation and fallback extraction strategies
- **Challenge**: Extracting structured data reliably
- **Solution**: Use structured output formats (JSON) and validation

### **Langchain Integration**
- **Challenge**: New dependency and learning curve
- **Solution**: Start with simple chains and iterate
- **Challenge**: Prompt engineering complexity
- **Solution**: Make prompts configurable and testable

## 📊 **Success Metrics**

### **Functional Requirements**
- ✅ Successfully fetch HTML from job offer URL
- ✅ Extract key job information using LLM (title, company, requirements)
- ✅ Generate personalized cover letter
- ✅ Output in markdown format
- ✅ Standalone script with JSON resume and job URL inputs

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

## 📝 **Notes**

- **Langchain** should be used to modularize parsing logic, prompt construction, and LLM invocation
- **Prompt templates** should be easily configurable for future tuning or personalization
- **Reuse existing infrastructure** where possible (LinkedInParser, PDF pipeline, error handling)
- **Follow existing patterns** (barrel exports, dependency injection, comprehensive testing)
- **Document all decisions** in memory bank for future reference
- **LLM-First Approach**: Use LLM for intelligent data extraction instead of complex web scraping 