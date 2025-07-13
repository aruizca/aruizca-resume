import { LinkedInParser, PromptRunner, ResumeBuilder, HtmlRenderer, PdfExporter } from '../index';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export class GenerateResume {
  constructor(
    private linkedInParser = new LinkedInParser(),
    private promptRunner = new PromptRunner(),
    private resumeBuilder = new ResumeBuilder(),
    private htmlRenderer = new HtmlRenderer(),
    private pdfExporter = new PdfExporter()
  ) {}

  async run(linkedInExportPath: string, outputDir: string) {
    await mkdir(outputDir, { recursive: true });
    // 1. Parse LinkedIn data
    const parsedData = await this.linkedInParser.parse(linkedInExportPath);
    // 2. Generate structured resume content with LLM
    const llmResumeData = await this.promptRunner.run(parsedData);
    // 3. Build JSON Resume
    const resume = this.resumeBuilder.build(llmResumeData);
    // 4. Write resume.json
    const jsonPath = join(outputDir, 'resume.json');
    await writeFile(jsonPath, JSON.stringify(resume, null, 2));
    // 5. Render HTML
    const html = await this.htmlRenderer.render(resume);
    const htmlPath = join(outputDir, 'resume.html');
    await writeFile(htmlPath, html);
    // 6. Export PDF
    const pdfPath = join(outputDir, 'resume.pdf');
    await this.pdfExporter.export(html, pdfPath);
    return { jsonPath, htmlPath, pdfPath };
  }
} 