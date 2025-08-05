import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PdfExporter {
  async export(html: string, pdfPath: string): Promise<void> {
    try {
      console.log(`📄 Generating PDF from HTML...`);
      
      // Create output directory if it doesn't exist
      const outputDir = join(pdfPath, '..');
      await mkdir(outputDir, { recursive: true });
      
      // Modify HTML to remove title only (keep the successful name removal)
      const cleanHtml = this.cleanHtmlForPdf(html);
      
      // Write HTML to temporary file
      const tempHtmlPath = join(outputDir, 'temp-resume.html');
      await writeFile(tempHtmlPath, cleanHtml);
      
      // Use the standalone Playwright script to avoid bundling issues
      try {
        console.log(`🔧 Generating PDF with Playwright (displayHeaderFooter: false)...`);
        await this.generatePdfWithStandaloneScript(tempHtmlPath, pdfPath);
        console.log(`✅ PDF generated using Playwright: ${pdfPath}`);
      } catch (playwrightError) {
        console.log(`⚠️  Playwright failed: ${playwrightError instanceof Error ? playwrightError.message : 'Unknown error'}`);
        console.log(`⚠️  This might be due to bundling issues. Please run: npx playwright install chromium`);
        throw playwrightError;
      }
      
      // Clean up temporary HTML file
      try {
        await execAsync(`rm "${tempHtmlPath}"`);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async generatePdfWithStandaloneScript(htmlPath: string, pdfPath: string): Promise<void> {
    // Use the standalone playwright-pdf.js script to avoid bundling issues
    const scriptPath = join(process.cwd(), 'playwright-pdf.js');
    const command = `node "${scriptPath}" "${htmlPath}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('✅ PDF generated successfully')) {
      console.warn(`⚠️  Playwright warnings: ${stderr}`);
    }
  }
  
  private cleanHtmlForPdf(html: string): string {
    // Remove or modify the title to prevent it from appearing in PDF metadata
    // This is the only change we keep - it successfully removed the name
    let cleanHtml = html.replace(/<title>.*?<\/title>/gi, '<title></title>');
    
    return cleanHtml;
  }
} 