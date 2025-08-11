import { Resume } from '../../domain';
import { IResumePdfExporter } from '../../domain/services/IJsonResumeExporter';
import { ResumeHtmlExporter } from './HtmlExporter';
import { PlaywrightPdfGenerator, PdfOptions } from '../../../shared';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

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

    // Debug: Save the customized HTML to a file for inspection
    try {
      const tempDir = tmpdir();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const debugHtmlPath = join(tempDir, `debug-resume-pdf-${dateStr}.html`);
      await writeFile(debugHtmlPath, pdfOptimizedHtml);
      console.log(`🔍 Debug HTML saved to: ${debugHtmlPath}`);
    } catch (error) {
      console.warn('⚠️ Could not save debug HTML:', error);
    }

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

    // Apply the working customizations directly in the resume PDF exporter
    // This is the approach that was working on August 9th
    return await this.generateResumePdf(pdfOptimizedHtml, resumePdfOptions);
  }

  /**
   * Generate PDF with resume-specific customizations applied at the Playwright level
   * This bypasses CSS specificity issues by applying styles directly in the browser context
   */
  private async generateResumePdf(html: string, options: PdfOptions): Promise<Buffer> {
    const { chromium } = await import('playwright');
    let browser: any;
    
    try {
      console.log(`🎭 Launching Playwright browser for resume PDF generation...`);
      
      // Launch browser
      browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Set viewport to A4 dimensions for proper page sizing
      await page.setViewportSize({ width: 595, height: 842 }); // A4 points
      
      // Load HTML content
      await page.setContent(html);
      
      // Apply minimal PDF customizations since HTML is now clean and simple
      await page.addStyleTag({
        content: `
          /* Minimal PDF optimizations for clean HTML */
          @media print {
            body {
              margin: 0 !important;
              padding: 0.5in !important;
            }
            
            .page-break {
              page-break-before: always !important;
            }
          }
        `
      });
      
      // Generate PDF with resume-specific options
      console.log(`📄 Generating PDF with resume customizations...`);
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        printBackground: options?.printBackground ?? true,
        margin: {
          top: options?.margin?.top || '0.5in',
          right: options?.margin?.right || '0.5in',
          bottom: options?.margin?.bottom || '0.5in',
          left: options?.margin?.left || '0.5in'
        },
        displayHeaderFooter: options?.displayHeaderFooter ?? true,
        headerTemplate: options?.headerTemplate || '<span></span>',
        footerTemplate: options?.footerTemplate || '<span></span>',
        preferCSSPageSize: false
      });
      
      console.log(`✅ Resume PDF generated successfully with customizations`);
      return pdfBuffer;
      
    } catch (error) {
      throw new Error(`Resume PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always close browser
      if (browser) {
        await browser.close();
      }
    }
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

    // No CSS customizations here - they are applied in the Playwright context
    // where they can properly override the theme's CSS

    return optimizedHtml;
  }
}