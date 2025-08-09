import { performanceMonitor } from '../../shared';
import { Resume } from '../domain';
import { JsonResumeValidator, PromptRunner } from '../index';
import { LinkedInZipParser } from '../infrastructure/parsers/LinkedInZipParser';

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
 * Core resume generation service focused solely on producing JSON resumes.
 * 
 * Takes a LinkedIn export ZIP file in memory and returns a JSON Resume object.
 * HTML/PDF export is handled by separate services that transform the JSON.
 */
export class ResumeGenerator {
  constructor(
    private linkedInParser = new LinkedInZipParser(),
    private promptRunner = new PromptRunner(),
    private validator = new JsonResumeValidator()
  ) {}

  /**
   * Extract email from parsed LinkedIn data for cache key
   */
  private extractEmailFromLinkedInData(parsedData: any): string | null {
    try {
      // Try to get email from emails array (primary email)
      if (parsedData.emails && Array.isArray(parsedData.emails) && parsedData.emails.length > 0) {
        const primaryEmail = parsedData.emails.find((emailEntry: any) => 
          emailEntry['Email Address'] && emailEntry['Email Address'].toLowerCase().includes('@')
        );
        if (primaryEmail) {
          return primaryEmail['Email Address'].toLowerCase().trim();
        }
      }

      // Fallback: try to get from profile data if available
      if (parsedData.profile && Array.isArray(parsedData.profile) && parsedData.profile.length > 0) {
        const profile = parsedData.profile[0];
        if (profile['Email Address']) {
          return profile['Email Address'].toLowerCase().trim();
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Could not extract email from LinkedIn data:', error);
      return null;
    }
  }

  /**
   * Generate a JSON resume from LinkedIn export ZIP data
   * @param linkedInZipData ZIP file data as Buffer, File, or ArrayBuffer
   * @param forceRefresh Whether to bypass cache for fresh AI content
   * @returns Resume generation result with JSON resume
   */
  async generateFromZip(linkedInZipData: Buffer | File | ArrayBuffer, forceRefresh: boolean = false): Promise<ResumeGenerationResult> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting JSON resume generation...');

      // 1. Parse LinkedIn data from ZIP
      const parseStart = Date.now();
      const parsedData = await performanceMonitor.trackOperation(
        'Parse LinkedIn ZIP Data',
        () => this.linkedInParser.parse(linkedInZipData),
        { logToConsole: true }
      );
      const parseTime = Date.now() - parseStart;

      // Debug: Log parsed profile data to help troubleshoot missing email
      console.log('🔍 DEBUG: Parsed LinkedIn profile data:');
      if (parsedData.profile && parsedData.profile.length > 0) {
        console.log('📄 Profile data structure:', Object.keys(parsedData.profile[0] || {}));
        console.log('📄 Full profile data:', JSON.stringify(parsedData.profile[0], null, 2));
      } else {
        console.log('❌ No profile data found in LinkedIn export');
      }

      // 2. Extract email for cache key
      const userEmail = this.extractEmailFromLinkedInData(parsedData);
      
      // 3. Generate JSON Resume with LLM (using email-based cache if email available)
      const llmStart = Date.now();
      let resume: Resume;
      
      if (userEmail) {
        console.log(`📧 Using email-based cache for user: ${userEmail}`);
        resume = await performanceMonitor.trackOperation(
          'Generate JSON Resume (LLM)',
          () => this.promptRunner.runWithEmailCache(parsedData, userEmail, forceRefresh),
          { logToConsole: true }
        );
      } else {
        console.log('⚠️ No email found, using general cache');
        resume = await performanceMonitor.trackOperation(
          'Generate JSON Resume (LLM)',
          () => this.promptRunner.run(parsedData, forceRefresh),
          { logToConsole: true }
        );
      }
      const llmTime = Date.now() - llmStart;

      // 4. Validate against JSON Resume schema
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
      console.error('❌ Resume generation failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    return await this.promptRunner.getCacheStats();
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.promptRunner.clearCache();
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
