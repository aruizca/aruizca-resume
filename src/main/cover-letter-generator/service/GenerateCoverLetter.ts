import { 
  JobOffer, 
  CoverLetter, 
  ParsedLinkedInData, 
  CoverLetterGenerationResult 
} from '../domain';
import { JobOfferScraper, DefaultJobOfferScraper } from '../infrastructure';
import { CoverLetterPromptRunner, DefaultCoverLetterPromptRunner } from '../infrastructure';
import { CoverLetterRenderer, DefaultCoverLetterRenderer } from '../infrastructure';
import { CoverLetterBuilder } from '../domain';
import { LinkedInParser } from '../../resume-generator/infrastructure/parsers/LinkedInParser';

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
    this.jobOfferScraper = jobOfferScraper || new DefaultJobOfferScraper();
    this.promptRunner = promptRunner || new DefaultCoverLetterPromptRunner();
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

      // Step 2: Parse LinkedIn data
      console.log('👤 Parsing LinkedIn data...');
      const userProfile = await this.linkedInParser.parse(linkedInExportPath);

      // Step 3: Generate cover letter content
      console.log('✍️ Generating cover letter content...');
      const content = await this.promptRunner.run(scrapingResult.jobOffer, userProfile);

      // Step 4: Build cover letter
      console.log('🏗️ Building cover letter...');
      const coverLetter = this.coverLetterBuilder.build(
        scrapingResult.jobOffer,
        userProfile,
        content
      );

      // Step 5: Render outputs
      console.log('📝 Rendering outputs...');
      const markdownContent = this.coverLetterRenderer.renderToMarkdown(coverLetter);
      const textContent = this.coverLetterRenderer.renderToText(coverLetter);

      // Step 6: Save files
      console.log('💾 Saving files...');
      const { writeFile, mkdir } = await import('fs/promises');
      const { join } = await import('path');
      
      await mkdir(outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const baseFileName = `cover-letter-${timestamp}`;
      
      const markdownPath = join(outputDir, `${baseFileName}.md`);
      const textPath = join(outputDir, `${baseFileName}.txt`);
      
      await writeFile(markdownPath, markdownContent);
      await writeFile(textPath, textContent);
      
      console.log(`✅ Cover letter generated successfully!`);
      console.log(`📄 Markdown: ${markdownPath}`);
      console.log(`📄 Text: ${textPath}`);

      return {
        success: true,
        coverLetter
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 