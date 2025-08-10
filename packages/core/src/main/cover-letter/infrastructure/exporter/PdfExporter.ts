import { CoverLetter } from '../../domain';
import { ICoverLetterPdfExporter } from '../../domain/services/ICoverLetterExporter';
import { CoverLetterHtmlExporter } from './HtmlExporter';
import { PlaywrightPdfGenerator } from '../../../shared';

/**
 * PDF exporter that transforms cover letters to PDF format
 * Uses shared PlaywrightPdfGenerator for PDF generation
 */
export class CoverLetterPdfExporter implements ICoverLetterPdfExporter {
  private pdfGenerator: PlaywrightPdfGenerator;

  constructor(
    private htmlExporter = new CoverLetterHtmlExporter(),
    pdfGenerator?: PlaywrightPdfGenerator
  ) {
    this.pdfGenerator = pdfGenerator || new PlaywrightPdfGenerator();
  }

  /**
   * Export a cover letter to PDF buffer
   * @param coverLetter The cover letter to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(coverLetter: CoverLetter, options?: any): Promise<Buffer> {
    // First export to HTML
    const html = await this.htmlExporter.export(coverLetter);
    
    // Then export HTML to PDF buffer using shared utility
    return await this.pdfGenerator.generateFromHtml(html, options, 'cover-letter');
  }
}
