import { LinkedInParser, PromptRunner, ResumeBuilder, HtmlRenderer, PdfExporter, JsonResumeValidator } from '../index';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export class GenerateResume {
  constructor(
    private linkedInParser = new LinkedInParser(),
    private promptRunner = new PromptRunner(),
    private resumeBuilder = new ResumeBuilder(),
    private htmlRenderer = new HtmlRenderer(),
    private pdfExporter = new PdfExporter(),
    private validator = new JsonResumeValidator()
  ) {}

  async run(linkedInExportPath: string, outputDir: string) {
    await mkdir(outputDir, { recursive: true });
    // 1. Parse LinkedIn data
    const parsedData = await this.linkedInParser.parse(linkedInExportPath);
    // 2. Generate structured resume content with LLM
    const llmResumeData = await this.promptRunner.run(parsedData);
    // 3. Build JSON Resume
    const resume = this.resumeBuilder.build(llmResumeData);
    
    // 3.5. Validate against JSON Resume schema
    console.log('🔍 Validating resume against JSON Resume schema...');
    const validationResult = this.validator.validateResume(resume);
    
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
    await writeFile(jsonPath, JSON.stringify(resume, null, 2));
    // 5. Render HTML
    const html = await this.htmlRenderer.render(resume);
    const htmlPath = join(outputDir, `resume${dateStr}.html`);
    await writeFile(htmlPath, html);
    // 6. Export PDF
    const pdfPath = join(outputDir, `resume${dateStr}.pdf`);
    await this.pdfExporter.export(html, pdfPath);
    return { jsonPath, htmlPath, pdfPath };
  }
} 