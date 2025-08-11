import { Resume } from '../../domain';
import { IResumePdfExporter } from '../../domain/services/IJsonResumeExporter';
import { ResumeHtmlExporter } from './HtmlExporter';

/**
 * Resume-specific PDF exporter with custom layout optimizations
 * Uses the HtmlExporter (jsonresume-theme-even) and applies CSS overrides for A4 printing
 */
export class ResumePdfExporter implements IResumePdfExporter {
  private htmlExporter: ResumeHtmlExporter;

  constructor() {
    this.htmlExporter = new ResumeHtmlExporter();
  }

  /**
   * Export a JSON resume to PDF buffer with resume-specific customizations
   * @param resume The JSON resume to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(resume: Resume, options?: any): Promise<Buffer> {
    try {
      // Get HTML from the HTML exporter (using jsonresume-theme-even)
      const html = await this.htmlExporter.export(resume);
      
      // Apply the working customizations directly in the resume PDF exporter
      // This is the approach that was working on August 9th
      return await this.generateResumePdf(html, options);
      
    } catch (error) {
      throw new Error(`Resume PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate PDF with resume-specific customizations applied at the Playwright level
   * This applies CSS overrides to the theme-generated HTML for A4 printing
   */
  private async generateResumePdf(html: string, options: any): Promise<Buffer> {
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
      
      // Apply minimal CSS overrides - similar to working JavaScript script
      await page.addStyleTag({
        content: `
          /* PDF Layout Optimizations - minimal overrides like working script */
          @media print { 
            body { 
              grid-template-columns: [full-start] 1fr [main-start side-start] 15% [side-end content-start] 85% [main-end content-end] 1fr [full-end] !important; 
              max-width: 95% !important; 
              overflow-x: hidden !important; 
            } 
            h3 { 
              grid-column: side !important; 
            } 
            section { 
              grid-column: content !important; 
            } 
            .masthead { 
              grid-column: full !important; 
            } 
            .masthead > * { 
              grid-column: main !important; 
            } 
            * { 
              max-width: 95% !important; 
              box-sizing: border-box !important; 
            } 
          }
          

          

        `
      });
      
      // Programmatically reduce font sizes - exactly as in working JavaScript file
      await page.evaluate(`
        (function() {
          // Function to reduce font size by 0.8px (less aggressive)
          function reduceFontSizes() {
            const elements = document.querySelectorAll('*');
            elements.forEach(function(el) {
              const computedStyle = window.getComputedStyle(el);
              const currentSize = parseFloat(computedStyle.fontSize);
              if (currentSize && !isNaN(currentSize)) {
                const newSize = Math.max(currentSize - 0.8, 10); // Minimum 10px for readability
                el.style.fontSize = newSize + 'px';
              }
            });
          }
          
          // Function to adjust column widths for CSS Grid layout
          function adjustColumnWidths() {
            // Target the body element which has the grid layout
            const body = document.querySelector('body');
            if (body) {
              // Override the grid template columns to achieve 15%/85% split
              body.style.gridTemplateColumns = '[full-start] 1fr [main-start side-start] 15% [side-end content-start] 85% [main-end content-end] 1fr [full-end]';
              
              // Also add CSS to ensure the grid areas work correctly and header spans both columns, and respect page dimensions
              const style = document.createElement('style');
              style.textContent = '@media print { body { grid-template-columns: [full-start] 1fr [main-start side-start] 15% [side-end content-start] 85% [main-end content-end] 1fr [full-end] !important; max-width: 95% !important; overflow-x: hidden !important; } h3 { grid-column: side !important; } section { grid-column: content !important; } .masthead { grid-column: full !important; } .masthead > * { grid-column: main !important; } * { max-width: 95% !important; box-sizing: border-box !important; } }';
              document.head.appendChild(style);
            }
          }
          
          // Run when DOM is loaded
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
              reduceFontSizes();
              adjustColumnWidths();
            });
          } else {
            reduceFontSizes();
            adjustColumnWidths();
          }
          
          // Also run after a short delay to ensure all styles are applied
          setTimeout(function() {
            reduceFontSizes();
            adjustColumnWidths();
          }, 100);
        })();
      `);
      
      // Generate PDF with resume-specific options
      console.log(`📄 Generating PDF with layout optimizations...`);
      const pdfBuffer = await page.pdf({
        format: options?.format || 'A4',
        printBackground: options?.printBackground ?? true,
        margin: {
          top: options?.margin?.top || '0.5in',
          right: options?.margin?.right || '0.5in',
          bottom: options?.margin?.bottom || '0.5in',
          left: options?.margin?.left || '0.5in'
        },
        displayHeaderFooter: true,
        headerTemplate: '<span></span>', // Clean header
        footerTemplate: this.getFooterTemplate(),
        preferCSSPageSize: true
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
   * Get the footer template for PDF pages
   * @returns Footer template HTML string
   */
  private getFooterTemplate(): string {
    return `
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
    `;
  }
}
