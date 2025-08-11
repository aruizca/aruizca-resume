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
 * Includes restored PDF layout optimizations and custom header/footer
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
   * Includes restored PDF layout optimizations and custom header/footer
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
      
      // Set viewport to A4 dimensions for proper page sizing
      await page.setViewportSize({ width: 595, height: 842 }); // A4 points
      
      // Load HTML content
      await page.setContent(await readFile(htmlPath, 'utf-8'));
      
      // Apply custom CSS for better PDF layout
      await page.addStyleTag({
        content: `
          /* PDF Layout Optimizations - Restored from previous improvements */
          body {
            max-width: 96.5% !important;
            margin: 0 auto !important;
            font-family: 'Lato', -apple-system, BlinkMacSystemFont, sans-serif !important;
          }
          
          /* Header section spans full width */
          .header, .masthead, .profile {
            width: 100% !important;
            max-width: 100% !important;
            grid-column: 1 / -1 !important;
          }
          
          /* Optimize font sizes for PDF */
          h1 {
            font-size: 2.5em !important;
            margin: 0.5em 0 !important;
          }
          
          h2 {
            font-size: 2em !important;
            margin: 0.4em 0 !important;
          }
          
          /* Ensure proper column layout */
          .container, .resume {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 2em !important;
          }
          
          /* Left column content */
          .left-column, .left {
            grid-column: 1 !important;
          }
          
          /* Right column content */
          .right-column, .right {
            grid-column: 2 !important;
          }
          
          /* Profile section spans both columns */
          .profile, .basics {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Print-specific optimizations */
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
      
      // Generate PDF with enhanced options
      console.log(`📄 Generating PDF from HTML with layout optimizations...`);
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
        headerTemplate: options?.headerTemplate || '<span></span>', // Clean header
        footerTemplate: options?.footerTemplate || `
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
        `,
        preferCSSPageSize: true
      });
      
      // Write PDF to file
      await writeFile(pdfPath, pdfBuffer);
      console.log(`✅ PDF generated successfully with Playwright and layout optimizations`);
      
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
