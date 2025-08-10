import { Resume } from '../../domain';
import { IResumePdfExporter } from '../../domain/services/IJsonResumeExporter';
import { ResumeHtmlExporter } from './HtmlExporter';
import { PlaywrightPdfGenerator, PdfOptions } from '../../../shared';

/**
 * PDF exporter that transforms JSON Resume to PDF format
 * Uses shared PlaywrightPdfGenerator for PDF generation
 */
export class ResumePdfExporter implements IResumePdfExporter {
  private pdfGenerator: PlaywrightPdfGenerator;

  constructor(
    private htmlExporter = new ResumeHtmlExporter(),
    pdfGenerator?: PlaywrightPdfGenerator
  ) {
    this.pdfGenerator = pdfGenerator || new PlaywrightPdfGenerator();
  }

  /**
   * Export a JSON resume to PDF buffer
   * @param resume The JSON resume to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(resume: Resume, options?: PdfOptions): Promise<Buffer> {
    // First export to HTML
    const html = await this.htmlExporter.export(resume);
    
    // Then export HTML to PDF buffer using shared utility
    return await this.pdfGenerator.generateFromHtml(html, options, 'resume');
  }
}