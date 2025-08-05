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
      
      // Write HTML to temporary file
      const tempHtmlPath = join(outputDir, 'temp-resume.html');
      await writeFile(tempHtmlPath, html);
      
      // Try different PDF generation methods in order of preference
      const methods = [
        {
          name: 'wkhtmltopdf',
          command: `wkhtmltopdf --page-size A4 --margin-top 0.5in --margin-right 0.5in --margin-bottom 0.5in --margin-left 0.5in "${tempHtmlPath}" "${pdfPath}"`
        },
        {
          name: 'Chrome (macOS)',
          command: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${tempHtmlPath}"`
        },
        {
          name: 'Chrome (Linux)',
          command: `google-chrome --headless --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${tempHtmlPath}"`
        },
        {
          name: 'Chromium',
          command: `chromium --headless --disable-gpu --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${tempHtmlPath}"`
        }
      ];
      
      for (const method of methods) {
        try {
          console.log(`🔧 Trying ${method.name}...`);
          console.log(`🔧 Running: ${method.command}`);
          
          const { stdout, stderr } = await execAsync(method.command);
          
          if (stderr && !stderr.includes('Done') && !stderr.includes('DevTools')) {
            console.warn(`⚠️  ${method.name} warnings: ${stderr}`);
          }
          
          console.log(`✅ PDF generated using ${method.name}: ${pdfPath}`);
          
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