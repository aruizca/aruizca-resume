import { Resume } from '../domain';
import { JsonResumeValidator } from '../infrastructure/validation/JsonResumeValidator';
import { LinkedInZipParser } from '../infrastructure/parsers/LinkedInZipParser';
import { BrowserPromptRunner } from '../infrastructure/langchain/BrowserPromptRunner';
import { performanceMonitor } from '../../shared';

export interface ResumeGenerationResult {
  success: boolean;
  resume?: Resume;
  error?: string;
  validationResult?: any;
  performance?: {
    parseTime: number;
    llmTime: number;
    validationTime: number;
    totalTime: number;
  };
}

/**
 * Browser-compatible resume generation service focused solely on producing JSON resumes.
 * 
 * Takes a LinkedIn export ZIP file in memory and returns a JSON Resume object.
 * This version is compatible with browser environments and doesn't use Node.js APIs.
 */
export class BrowserResumeGenerator {
  constructor(
    private linkedInParser = new LinkedInZipParser(),
    private promptRunner = new BrowserPromptRunner(),
    private validator = new JsonResumeValidator()
  ) {}

  /**
   * Generate a JSON resume from LinkedIn export ZIP data
   * @param linkedInZipData ZIP file data as Buffer, File, or ArrayBuffer
   * @param forceRefresh Whether to bypass cache for fresh AI content
   * @returns Resume generation result with JSON resume
   */
  async generateFromZip(linkedInZipData: Buffer | File | ArrayBuffer, forceRefresh: boolean = false): Promise<ResumeGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting JSON resume generation (browser)...');

      // 1. Parse LinkedIn data from ZIP
      const parseStart = Date.now();
      const parsedData = await performanceMonitor.trackOperation(
        'Parse LinkedIn ZIP Data',
        () => this.linkedInParser.parse(linkedInZipData),
        { logToConsole: true }
      );
      const parseTime = Date.now() - parseStart;

      // 2. Generate JSON Resume with LLM
      const llmStart = Date.now();
      const resume = await performanceMonitor.trackOperation(
        'Generate JSON Resume (LLM)',
        () => this.promptRunner.run(parsedData, forceRefresh),
        { logToConsole: true }
      );
      const llmTime = Date.now() - llmStart;
      
      // 3. Validate against JSON Resume schema
      const validationStart = Date.now();
      console.log('🔍 Validating resume against JSON Resume schema...');
      const validationResult = performanceMonitor.trackSyncOperation(
        'Validate JSON Resume Schema',
        () => this.validator.validateResume(resume),
        { logToConsole: true }
      );
      const validationTime = Date.now() - validationStart;

      if (!validationResult.isValid) {
        console.warn('⚠️  Resume validation warnings:');
        console.warn(this.validator.getErrorSummary(validationResult));
        console.warn('Continuing with generation...');
      } else {
        console.log('✅ Resume is valid according to JSON Resume schema');
      }
      
      const totalTime = Date.now() - startTime;
      
      console.log('🎉 JSON resume generation completed successfully');
      
      return {
        success: true,
        resume: resume as Resume,
        validationResult,
        performance: {
          parseTime,
          llmTime,
          validationTime,
          totalTime
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ JSON resume generation failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get cache statistics (browser version - returns empty stats)
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    // Browser version doesn't support file-based caching
    return { totalEntries: 0, totalSize: 0 };
  }

  /**
   * Clear the cache (browser version - no-op)
   */
  async clearCache(): Promise<void> {
    // Browser version doesn't support file-based caching
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return performanceMonitor.getStats();
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): string {
    return performanceMonitor.getSummary();
  }
}
