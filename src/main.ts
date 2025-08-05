import { GenerateResume, LinkedInExportFinder } from './resume-generator/index';
import { join } from 'path';

async function main() {
  const linkedInExportFinder = new LinkedInExportFinder();
  const outputDir = join(process.cwd(), 'output');
  const generator = new GenerateResume();
  
  try {
    // Use command line argument if provided, otherwise find newest export
    const extractedDir = process.argv[2] || await linkedInExportFinder.findNewestExport();
    
    const { jsonPath, htmlPath, pdfPath } = await generator.run(extractedDir, outputDir);
    console.log('✅ Resume generated!');
    console.log('JSON:', jsonPath);
    console.log('HTML:', htmlPath);
    console.log('PDF:', pdfPath);
  } catch (err) {
    console.error('❌ Failed to generate resume:', err);
    process.exit(1);
  }
}

main(); 