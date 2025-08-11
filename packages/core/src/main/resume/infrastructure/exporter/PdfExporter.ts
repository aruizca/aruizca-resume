import { Resume } from '../../domain';
import { IResumePdfExporter } from '../../domain/services/IJsonResumeExporter';
import { ResumeHtmlExporter } from './HtmlExporter';
import { PlaywrightPdfGenerator, PdfOptions } from '../../../shared';

/**
 * Resume-specific PDF exporter with custom layout optimizations
 * Reuses ResumeHtmlExporter and applies PDF customizations before PDF generation
 */
export class ResumePdfExporter implements IResumePdfExporter {
  private pdfGenerator: PlaywrightPdfGenerator;
  private htmlExporter: ResumeHtmlExporter;

  constructor(
    htmlExporter = new ResumeHtmlExporter(),
    pdfGenerator?: PlaywrightPdfGenerator
  ) {
    this.htmlExporter = htmlExporter;
    this.pdfGenerator = pdfGenerator || new PlaywrightPdfGenerator();
  }

  /**
   * Export a JSON resume to PDF buffer with resume-specific customizations
   * @param resume The JSON resume to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(resume: Resume, options?: PdfOptions): Promise<Buffer> {
    // First export to HTML using the existing HTML exporter
    const html = await this.htmlExporter.export(resume);
    
    // Apply PDF-specific customizations to the HTML
    const pdfOptimizedHtml = this.applyPdfCustomizations(html);
    
    // Create PDF options with resume-specific header/footer templates
    const resumePdfOptions: PdfOptions = {
      ...options,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>', // Clean header
      footerTemplate: `
        <div style="
          font-family: 'Lato', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 10px;
          color: #666;
          text-align: right;
          padding: 0 20px;
          width: 100%;
        ">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    };
    
    // Then export the customized HTML to PDF using the generic PDF generator
    return await this.pdfGenerator.generateFromHtml(pdfOptimizedHtml, resumePdfOptions, 'resume');
  }

  /**
   * Apply PDF-specific customizations to the HTML content
   * @param html The HTML content from ResumeHtmlExporter
   * @returns HTML with PDF customizations applied
   */
  private applyPdfCustomizations(html: string): string {
    // Remove any script tags that might interfere with PDF generation
    let optimizedHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove or modify the title to prevent it from appearing in PDF metadata
    optimizedHtml = optimizedHtml.replace(/<title>.*?<\/title>/gi, '<title></title>');
    
    // Add PDF-specific CSS customizations
    const pdfStyles = `
      <style>
        /* Resume-specific PDF customizations */
        .masthead, .profile, .basics {
          width: 100% !important;
          max-width: 100% !important;
        }
        
        body {
          max-width: 96.5% !important;
          margin: 0 auto !important;
        }
      </style>
    `;
    
    // Insert the styles before the closing head tag
    optimizedHtml = optimizedHtml.replace('</head>', `${pdfStyles}</head>`);
    
    return optimizedHtml;
  }
}