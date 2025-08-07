import { JobOffer, CoverLetter, CoverLetterBuilder, ParsedLinkedInData } from '../domain';
import { JobOfferScraper, DefaultJobOfferScraper, CoverLetterPromptRunner, DefaultCoverLetterPromptRunner, CoverLetterRenderer, DefaultCoverLetterRenderer, JobPostingCache } from '../infrastructure';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { readFileSync } from 'fs';
import { LinkedInParser } from '../../resume';

export interface CoverLetterGenerationResult {
  success: boolean;
  coverLetter?: CoverLetter;
  error?: string;
}

export class GenerateCoverLetter {
  private jobOfferScraper: JobOfferScraper;
  private promptRunner: CoverLetterPromptRunner;
  private coverLetterRenderer: CoverLetterRenderer;
  private coverLetterBuilder: CoverLetterBuilder;
  private linkedInParser: LinkedInParser;

  constructor(
    jobOfferScraper?: JobOfferScraper,
    promptRunner?: CoverLetterPromptRunner,
    coverLetterRenderer?: CoverLetterRenderer,
    coverLetterBuilder?: CoverLetterBuilder,
    linkedInParser?: LinkedInParser
  ) {
    this.promptRunner = promptRunner || new DefaultCoverLetterPromptRunner();
    this.jobOfferScraper = jobOfferScraper || new DefaultJobOfferScraper();
    this.coverLetterRenderer = coverLetterRenderer || new DefaultCoverLetterRenderer();
    this.coverLetterBuilder = coverLetterBuilder || new CoverLetterBuilder();
    this.linkedInParser = linkedInParser || new LinkedInParser();
  }

  async run(
    jobOfferUrl: string, 
    linkedInExportPath: string, 
    outputDir: string
  ): Promise<CoverLetterGenerationResult> {
    try {
      console.log('🚀 Starting cover letter generation...');
      
      // Step 1: Scrape job offer
      console.log('📄 Scraping job offer...');
      const scrapingResult = await this.jobOfferScraper.scrape(jobOfferUrl);
      if (!scrapingResult.success || !scrapingResult.jobOffer) {
        return {
          success: false,
          error: scrapingResult.error || 'Failed to scrape job offer'
        };
      }

      // Step 2: Load JSON resume
      console.log('📄 Loading JSON resume...');
      const resumeJson = await this.loadJsonResume();

      // Step 3: Generate cover letter with JSON inputs
      console.log('✍️ Generating cover letter with JSON inputs...');
      const jobPostingJson = JSON.stringify(scrapingResult.jobOffer, null, 2);
      const coverLetterMarkdown = await this.promptRunner.runWithJson(jobPostingJson, resumeJson);

      // Step 4: Save markdown output
      console.log('💾 Saving markdown output...');
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      
      await mkdir(outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const baseFileName = `cover-letter-${timestamp}`;
      
      const markdownPath = join(outputDir, `${baseFileName}.md`);
      
      await writeFile(markdownPath, coverLetterMarkdown);
      
      console.log(`✅ Cover letter generated successfully!`);
      console.log(`📄 Markdown: ${markdownPath}`);

      // Show cache statistics if available
      if (this.jobOfferScraper && typeof (this.jobOfferScraper as any).getCacheStats === 'function') {
        try {
          const cacheStats = await (this.jobOfferScraper as any).getCacheStats();
          console.log(`📊 Job posting cache stats: ${cacheStats.totalEntries} entries, ${(cacheStats.totalSize / 1024).toFixed(1)}KB`);
        } catch (error) {
          // Cache stats not available, ignore
        }
      }

      return {
        success: true,
        coverLetter: {
          jobOffer: scrapingResult.jobOffer,
          userProfile: {} as ParsedLinkedInData, // We're using JSON directly now
          content: coverLetterMarkdown,
          generatedAt: new Date(),
          metadata: {
            wordCount: this.countWords(coverLetterMarkdown),
            tone: 'professional',
            focusAreas: []
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async runWithJsonResume(
    jsonResumePath: string,
    jobOfferUrl: string, 
    outputDir: string
  ): Promise<CoverLetterGenerationResult> {
    try {
      console.log('🚀 Starting cover letter generation with JSON resume...');
      
      // Step 1: Load JSON resume from provided path
      console.log(`📄 Loading JSON resume from: ${jsonResumePath}`);
      const resumeJson = await this.loadJsonResumeFromPath(jsonResumePath);

      // Step 2: Scrape job offer
      console.log('📄 Scraping job offer...');
      const scrapingResult = await this.jobOfferScraper.scrape(jobOfferUrl);
      if (!scrapingResult.success || !scrapingResult.jobOffer) {
        return {
          success: false,
          error: scrapingResult.error || 'Failed to scrape job offer'
        };
      }

      // Step 3: Generate cover letter with JSON inputs
      console.log('✍️ Generating cover letter with JSON inputs...');
      const jobPostingJson = JSON.stringify(scrapingResult.jobOffer, null, 2);
      const coverLetterMarkdown = await this.promptRunner.runWithJson(jobPostingJson, resumeJson);

      // Step 4: Save markdown output
      console.log('💾 Saving markdown output...');
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      
      await mkdir(outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const baseFileName = `cover-letter-${timestamp}`;
      
      const markdownPath = join(outputDir, `${baseFileName}.md`);
      
      await writeFile(markdownPath, coverLetterMarkdown);
      
      console.log(`✅ Cover letter generated successfully!`);
      console.log(`📄 Markdown: ${markdownPath}`);

      return {
        success: true,
        coverLetter: {
          jobOffer: scrapingResult.jobOffer,
          userProfile: {} as ParsedLinkedInData, // We're using JSON directly now
          content: coverLetterMarkdown,
          generatedAt: new Date(),
          metadata: {
            wordCount: this.countWords(coverLetterMarkdown),
            tone: 'professional',
            focusAreas: []
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async runWithTestHtml(
    jsonResumePath: string,
    jobOfferUrl: string,
    testHtmlPath: string,
    outputDir: string
  ): Promise<CoverLetterGenerationResult> {
    try {
      console.log('🚀 Starting cover letter generation with test HTML...');
      
      // Step 1: Load JSON resume from provided path
      console.log(`📄 Loading JSON resume from: ${jsonResumePath}`);
      const resumeJson = await this.loadJsonResumeFromPath(jsonResumePath);

      // Step 2: Load test HTML file
      console.log(`📄 Loading test HTML from: ${testHtmlPath}`);
      const { readFileSync } = await import('fs');
      const html = readFileSync(testHtmlPath, 'utf-8');
      console.log(`📄 Loaded HTML (${html.length} characters)`);

      // Step 3: Extract job information using LLM
      console.log('🔍 Extracting job information from test HTML...');
      const jobOffer = await this.promptRunner.extractJobInfoFromHtml(html);
      jobOffer.url = jobOfferUrl; // Set the URL from the original request

      // Step 4: Generate cover letter with JSON inputs
      console.log('✍️ Generating cover letter with JSON inputs...');
      const jobPostingJson = JSON.stringify(jobOffer, null, 2);
      const coverLetterMarkdown = await this.promptRunner.runWithJson(jobPostingJson, resumeJson);

      // Step 5: Save markdown output
      console.log('💾 Saving markdown output...');
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      
      await mkdir(outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const baseFileName = `cover-letter-${timestamp}`;
      
      const markdownPath = join(outputDir, `${baseFileName}.md`);
      
      await writeFile(markdownPath, coverLetterMarkdown);
      
      console.log(`✅ Cover letter generated successfully!`);
      console.log(`📄 Markdown: ${markdownPath}`);

      // Show cache statistics if available
      if (this.jobOfferScraper && typeof (this.jobOfferScraper as any).getCacheStats === 'function') {
        try {
          const cacheStats = await (this.jobOfferScraper as any).getCacheStats();
          console.log(`📊 Job posting cache stats: ${cacheStats.totalEntries} entries, ${(cacheStats.totalSize / 1024).toFixed(1)}KB`);
        } catch (error) {
          // Cache stats not available, ignore
        }
      }

      return {
        success: true,
        coverLetter: {
          jobOffer,
          userProfile: {} as ParsedLinkedInData, // We're using JSON directly now
          content: coverLetterMarkdown,
          generatedAt: new Date(),
          metadata: {
            wordCount: this.countWords(coverLetterMarkdown),
            tone: 'professional',
            focusAreas: []
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async loadJsonResume(): Promise<string> {
    try {
      // Look for the most recent JSON resume file
      const resumeDir = join(process.cwd(), 'resume');
      const { readdir, readFile } = await import('fs/promises');
      
      const files = await readdir(resumeDir);
      const jsonFiles = files.filter(file => file.endsWith('.json')).sort().reverse();
      
      if (jsonFiles.length === 0) {
        throw new Error('No JSON resume files found in resume directory');
      }
      
      const latestResumeFile = join(resumeDir, jsonFiles[0]);
      const resumeContent = await readFile(latestResumeFile, 'utf-8');
      
      console.log(`📄 Loaded JSON resume: ${jsonFiles[0]}`);
      return resumeContent;
    } catch (error) {
      throw new Error(`Failed to load JSON resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async loadJsonResumeFromPath(path: string): Promise<string> {
    try {
      const { readFile } = await import('fs/promises');
      const resumeContent = await readFile(path, 'utf-8');
      console.log(`📄 Loaded JSON resume from path: ${path}`);
      return resumeContent;
    } catch (error) {
      throw new Error(`Failed to load JSON resume from path ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
} 