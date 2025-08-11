import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { chromium, Browser, Page } from 'playwright';

/**
 * Shared PDF generation options
 */
export interface PdfOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

/**
 * Shared PDF generation utility using Playwright
 * Eliminates code duplication between resume and cover letter exporters
 */
export class PlaywrightPdfGenerator {
  /**
   * Generate PDF from HTML content
   * @param html HTML content to convert to PDF
   * @param options PDF generation options
   * @param filenamePrefix Prefix for temporary files
   * @returns PDF as Buffer
   */
  async generateFromHtml(
    html: string, 
    options?: PdfOptions, 
    filenamePrefix: string = 'document'
  ): Promise<Buffer> {
    try {
      console.log(`📄 Generating PDF buffer from HTML...`);
      
      // Create temporary files
      const tempDir = tmpdir();
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const tempHtmlPath = join(tempDir, `${filenamePrefix}-${dateStr}.html`);
      const tempPdfPath = join(tempDir, `${filenamePrefix}-${dateStr}.pdf`);
      
      // Write HTML to temp file
      await writeFile(tempHtmlPath, html);
      
      try {
        // Generate PDF using Playwright
        await this.generatePdfWithPlaywright(tempHtmlPath, tempPdfPath, options);
        
        // Read PDF as buffer
        const pdfBuffer = await readFile(tempPdfPath);
        
        console.log(`✅ PDF buffer generated successfully`);
        return pdfBuffer;
        
      } finally {
        // Clean up temp files (ignore errors)
        try {
          await unlink(tempHtmlPath).catch(() => {});
          await unlink(tempPdfPath).catch(() => {});
        } catch {
          // Ignore cleanup errors
        }
      }
      
    } catch (error) {
      throw new Error(`Failed to generate PDF buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Generate PDF using Playwright browser automation
   */
  private async generatePdfWithPlaywright(
    htmlPath: string, 
    pdfPath: string, 
    options?: PdfOptions
  ): Promise<void> {
    let browser: Browser | undefined;
    
    try {
      console.log(`🎭 Launching Playwright browser for PDF generation...`);
      
      // Launch browser
      browser = await chromium.launch();
      const page = await browser.newPage();
      
      // Load HTML content
      await page.setContent(await readFile(htmlPath, 'utf-8'));

      // Generate PDF with enhanced options
      console.log(`📄 Generating PDF from HTML...`);
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        printBackground: options?.printBackground ?? true,
        margin: {
          top: options?.margin?.top || '0.5in',
          right: options?.margin?.right || '0.5in',
          bottom: options?.margin?.bottom || '0.5in',
          left: options?.margin?.left || '0.5in'
        },
        displayHeaderFooter: options?.displayHeaderFooter ?? false,
        headerTemplate: options?.headerTemplate,
        footerTemplate: options?.footerTemplate,
        preferCSSPageSize: false
      });
      
      // Write PDF to file
      await writeFile(pdfPath, pdfBuffer);
      console.log(`✅ PDF generated successfully with Playwright`);
      
    } catch (error) {
      throw new Error(`Playwright PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Always close browser
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Clean HTML content for better PDF rendering
   */
  cleanHtmlForPdf(html: string): string {
    // Remove any script tags that might interfere with PDF generation
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}
