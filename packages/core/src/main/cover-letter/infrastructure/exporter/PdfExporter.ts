import { CoverLetter } from '../../domain';
import { CoverLetterHtmlExporter } from './HtmlExporter';

/**
 * PDF exporter that transforms cover letters to PDF format
 * Self-contained with direct Playwright control for font and layout customization
 */
export class CoverLetterPdfExporter {
  constructor(
    private htmlExporter = new CoverLetterHtmlExporter()
  ) {}

  /**
   * Export a cover letter to PDF buffer
   * @param coverLetter The cover letter to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(coverLetter: CoverLetter, options?: any): Promise<Buffer> {
    try {
      // First export to HTML
      const html = await this.htmlExporter.export(coverLetter);
      
      // Use the same approach as the working resume PDF exporter
      return await this.generateCoverLetterPdf(html, options);
      
    } catch (error) {
      throw new Error(`Cover letter PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF with cover letter-specific customizations applied at the Playwright level
   * This applies CSS overrides to the HTML for A4 printing and font control
   */
  private async generateCoverLetterPdf(html: string, options: any): Promise<Buffer> {
    const { chromium } = await import('playwright');
    let browser: any;
    
    try {
      console.log(`🎭 Launching Playwright browser for cover letter PDF generation...`);
      
      // Launch browser
      browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Set viewport to A4 dimensions for proper page sizing
      await page.setViewportSize({ width: 595, height: 842 }); // A4 points
      
      // Load HTML content
      await page.setContent(html);
      
      // Apply CSS overrides using the same approach as resume exporter
      await page.addStyleTag({
        content: `
          /* Cover Letter PDF Layout and Typography */
          body {
            font-family: Arial, Calibri, Garamond, 'Times New Roman', serif !important;
            font-size: 12pt !important;
            line-height: 1.15 !important;
            color: #333 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .cover-letter-content {
            max-width: 21cm !important;
            margin: 0 auto !important;
            padding: 2.54cm !important;
            background: white !important;
          }
          
          h1 {
            font-family: Arial, Calibri, Garamond, 'Times New Roman', serif !important;
            font-size: 16pt !important;
            font-weight: bold !important;
            text-align: left !important;
            margin-bottom: 1em !important;
            color: #2c3e50 !important;
          }
          
          p {
            margin: 0 0 1em 0 !important;
            text-align: left !important;
            text-indent: 0 !important;
          }
          
          strong {
            font-weight: bold !important;
          }
          
          em {
            font-style: italic !important;
          }
          
          a {
            color: #3498db !important;
            text-decoration: underline !important;
          }
          
          hr {
            border: none !important;
            border-top: 1px solid #ddd !important;
            margin: 1em 0 !important;
          }
        `
      });
      
      // Generate PDF with cover letter specific options
      console.log(`📄 Generating cover letter PDF with typography customizations...`);
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        printBackground: options?.printBackground ?? true,
        margin: {
          top: options?.margin?.top || '1in',
          right: options?.margin?.right || '1in',
          bottom: options?.margin?.bottom || '1in',
          left: options?.margin?.left || '1in'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: true
      });
      
      console.log(`✅ Cover letter PDF generated successfully with customizations`);
      return pdfBuffer;
      
    } catch (error) {
      throw new Error(`Playwright PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always close browser
      if (browser) {
        await browser.close();
      }
    }
  }
}
