import { LinkedInParser, PromptRunner, ResumeBuilder, HtmlRenderer, PdfExporter, JsonResumeValidator } from '../index';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { performanceMonitor } from '../../shared/infrastructure/utils/performanceMonitor';

export class GenerateResume {
  constructor(
    private linkedInParser = new LinkedInParser(),
    private promptRunner = new PromptRunner(),
    private resumeBuilder = new ResumeBuilder(),
    private htmlRenderer = new HtmlRenderer(),
    private pdfExporter = new PdfExporter(),
    private validator = new JsonResumeValidator()
  ) {}

  async run(linkedInExportPath: string, outputDir: string, forceRefresh: boolean = false) {
    await mkdir(outputDir, { recursive: true });
    
    // 1. Parse LinkedIn data
    const parsedData = await performanceMonitor.trackOperation(
      'Parse LinkedIn Data',
      () => this.linkedInParser.parse(linkedInExportPath),
      { logToConsole: true }
    );
    
    // 2. Generate structured resume content with LLM
    const llmResumeData = await performanceMonitor.trackOperation(
      'Generate Resume Content (LLM)',
      () => this.promptRunner.run(parsedData, forceRefresh),
      { logToConsole: true }
    );
    
    // 3. Build JSON Resume
    const resume = performanceMonitor.trackSyncOperation(
      'Build JSON Resume',
      () => this.resumeBuilder.build(llmResumeData),
      { logToConsole: true }
    );
    
    // 3.5. Validate against JSON Resume schema
    console.log('🔍 Validating resume against JSON Resume schema...');
    const validationResult = performanceMonitor.trackSyncOperation(
      'Validate JSON Resume Schema',
      () => this.validator.validateResume(resume),
      { logToConsole: true }
    );
    
    if (!validationResult.isValid) {
      console.warn('⚠️  Resume validation warnings:');
      console.warn(this.validator.getErrorSummary(validationResult));
      console.warn('Continuing with generation...');
    } else {
      console.log('✅ Resume is valid according to JSON Resume schema');
    }
    
    // Get current date in -yyyymmdd format
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    
    // 4. Write resume.json
    const jsonPath = join(outputDir, `resume${dateStr}.json`);
    await performanceMonitor.trackOperation(
      'Write JSON File',
      () => writeFile(jsonPath, JSON.stringify(resume, null, 2)),
      { logToConsole: true }
    );
    
    // 5. Render HTML
    const html = await performanceMonitor.trackOperation(
      'Render HTML',
      () => this.htmlRenderer.render(resume),
      { logToConsole: true }
    );
    
    const htmlPath = join(outputDir, `resume${dateStr}.html`);
    await performanceMonitor.trackOperation(
      'Write HTML File',
      () => writeFile(htmlPath, html),
      { logToConsole: true }
    );
    
    // 6. Export PDF
    const pdfPath = join(outputDir, `resume${dateStr}.pdf`);
    await performanceMonitor.trackOperation(
      'Generate PDF',
      () => this.pdfExporter.export(html, pdfPath),
      { logToConsole: true }
    );
    
    return { jsonPath, htmlPath, pdfPath };
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