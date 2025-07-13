import { GenerateResume } from './resume-generator/index';
import { join } from 'path';

async function main() {
  const extractedDir = process.argv[2] || join(process.cwd(), 'linkedin-export', 'extracted');
  const outputDir = join(process.cwd(), 'output');
  const generator = new GenerateResume();
  try {
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