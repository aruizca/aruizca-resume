import { readFile } from 'fs/promises';
import { join } from 'path';
import { PdfExporter } from './resume-generator/infrastructure/output/PdfExporter';

async function generatePdfFromHtml() {
  try {
    // Get HTML file path from command line argument or use default
    const htmlPath = process.argv[2] || join(process.cwd(), 'output', 'resume-20250805.html');
    const outputDir = join(process.cwd(), 'output');
    
    console.log(`📄 Generating PDF from HTML: ${htmlPath}`);
    
    // Read the HTML file
    const html = await readFile(htmlPath, 'utf8');
    
    // Generate output filename based on input
    const htmlFileName = htmlPath.split('/').pop()?.replace('.html', '') || 'resume';
    const pdfPath = join(outputDir, `${htmlFileName}.pdf`);
    
    // Use the existing PDF exporter
    const pdfExporter = new PdfExporter();
    await pdfExporter.export(html, pdfPath);
    
    console.log('✅ PDF generated successfully!');
    console.log('PDF:', pdfPath);
    
  } catch (error) {
    console.error('❌ Failed to generate PDF:', error);
    process.exit(1);
  }
}

// Show usage if no arguments provided
if (process.argv.length < 3) {
  console.log('📄 PDF Generator from HTML');
  console.log('');
  console.log('Usage:');
  console.log('  npm run pdf <html-file-path>');
  console.log('  npm run pdf output/resume-20250805.html');
  console.log('');
  console.log('If no file is specified, uses: output/resume-20250805.html');
  console.log('');
}

generatePdfFromHtml(); 