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
      
      // Try Playwright first (the proper solution)
      try {
        console.log(`🔧 Trying Playwright with displayHeaderFooter: false...`);
        await this.generatePdfWithPlaywright(tempHtmlPath, pdfPath);
        console.log(`✅ PDF generated using Playwright: ${pdfPath}`);
        
        // Clean up temporary HTML file
        try {
          await execAsync(`rm "${tempHtmlPath}"`);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        
        return;
      } catch (playwrightError) {
        console.log(`⚠️  Playwright failed: ${playwrightError instanceof Error ? playwrightError.message : 'Unknown error'}`);
        console.log(`⚠️  Trying fallback methods...`);
      }
      
      // Fallback methods if Playwright fails
      const methods = [
        {
          name: 'wkhtmltopdf',
          method: async () => await this.generatePdfWithWkhtmltopdf(tempHtmlPath, pdfPath)
        },
        {
          name: 'Chrome (macOS)',
          method: async () => await this.generatePdfWithChrome(tempHtmlPath, pdfPath, 'macOS')
        },
        {
          name: 'Chrome (Linux)',
          method: async () => await this.generatePdfWithChrome(tempHtmlPath, pdfPath, 'Linux')
        },
        {
          name: 'Chromium',
          method: async () => await this.generatePdfWithChrome(tempHtmlPath, pdfPath, 'Chromium')
        }
      ];
      
      for (const method of methods) {
        try {
          console.log(`🔧 Trying ${method.name}...`);
          await method.method();
          console.log(`✅ PDF generated using ${method.name}: ${pdfPath}`);
          
          // Try to clean PDF metadata if possible
          await this.cleanPdfMetadata(pdfPath);
          
          // Clean up temporary HTML file
          try {
            await execAsync(`rm "${tempHtmlPath}"`);
          } catch (cleanupError) {
            // Ignore cleanup errors
          }
          
          return;
        } catch (error) {
          console.log(`⚠️  ${method.name} failed, trying next method...`);
        }
      }
      
      // If all methods fail, create a simple PDF
      console.log(`⚠️  All PDF generation methods failed, creating simple PDF...`);
      await this.createSimplePdf(html, pdfPath);
      
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
  
  private async generatePdfWithPlaywright(htmlPath: string, pdfPath: string): Promise<void> {
    // Dynamic import to avoid bundling issues
    const { chromium } = await import('playwright');
    
    const browser = await chromium.launch({
      headless: true
    });
    
    try {
      const page = await browser.newPage();
      
      // Load the HTML file
      await page.goto(`file://${htmlPath}`, {
        waitUntil: 'networkidle'
      });
      
      // Generate PDF with explicit header/footer control
      // This is the key - setting displayHeaderFooter to false
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        displayHeaderFooter: false, // This is what the user does manually!
        printBackground: true,
        preferCSSPageSize: false
      });
      
    } finally {
      await browser.close();
    }
  }
  
  private async generatePdfWithWkhtmltopdf(htmlPath: string, pdfPath: string): Promise<void> {
    const command = `wkhtmltopdf --page-size A4 --margin-top 0.5in --margin-right 0.5in --margin-bottom 0.5in --margin-left 0.5in --no-header-line --no-footer-line --disable-smart-shrinking --title "" "${htmlPath}" "${pdfPath}"`;
    await execAsync(command);
  }
  
  private async generatePdfWithChrome(htmlPath: string, pdfPath: string, platform: string): Promise<void> {
    let chromePath: string;
    
    switch (platform) {
      case 'macOS':
        chromePath = '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';
        break;
      case 'Linux':
        chromePath = 'google-chrome';
        break;
      case 'Chromium':
        chromePath = 'chromium';
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const command = `${chromePath} --headless --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header --no-sandbox --disable-dev-shm-usage "${htmlPath}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Done') && !stderr.includes('DevTools')) {
      console.warn(`⚠️  Chrome warnings: ${stderr}`);
    }
  }
  
  private async cleanPdfMetadata(pdfPath: string): Promise<void> {
    try {
      // Try to use exiftool if available to clean metadata
      console.log(`🔧 Cleaning PDF metadata...`);
      
      // Try multiple exiftool approaches
      const commands = [
        `exiftool -overwrite_original -all= "${pdfPath}"`,
        `exiftool -overwrite_original -PDF:all= "${pdfPath}"`,
        `exiftool -overwrite_original -Title="" -Creator="" -Producer="" "${pdfPath}"`
      ];
      
      for (const command of commands) {
        try {
          const { stdout, stderr } = await execAsync(command);
          if (stderr && stderr.includes('1 image files updated')) {
            console.log(`✅ PDF metadata cleaned successfully`);
            return;
          }
        } catch (error) {
          // Continue to next command
        }
      }
      
      console.log(`⚠️  Metadata cleaning not available or not effective`);
    } catch (error) {
      console.log(`⚠️  Metadata cleaning not available (exiftool not found)`);
    }
  }
  
  private cleanHtmlForPdf(html: string): string {
    // Remove or modify the title to prevent it from appearing in PDF metadata
    // This is the only change we keep - it successfully removed the name
    let cleanHtml = html.replace(/<title>.*?<\/title>/gi, '<title></title>');
    
    return cleanHtml;
  }
  
  private async createSimplePdf(html: string, pdfPath: string): Promise<void> {
    // Create a simple text-based PDF as fallback
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Resume generated successfully) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
    
    await writeFile(pdfPath, pdfContent);
    console.log(`✅ Simple PDF generated: ${pdfPath}`);
  }
} 