import { GenerateResume, LinkedInExportFinder } from './resume-generator/index';
import { validateEnvironment, validateLinkedInExportDirectory, validateOutputDirectory, validateCommandLineArgs, resolveErrorMessage } from './shared';
import { join } from 'path';

async function main() {
  try {
    // Validate environment and inputs
    console.log('🔍 Validating environment and inputs...');
    await validateEnvironment();
    
    const outputDir = join(process.cwd(), 'output');
    await validateOutputDirectory(outputDir);
    
    // Validate command line arguments if provided
    const args = process.argv.slice(2);
    validateCommandLineArgs(args);
    
    const linkedInExportFinder = new LinkedInExportFinder();
    const generator = new GenerateResume();
    
    // Use command line argument if provided, otherwise find newest export
    let extractedDir: string;
    if (args.length > 0) {
      extractedDir = args[0];
      console.log(`📁 Using custom LinkedIn export path: ${extractedDir}`);
    } else {
      console.log('📁 Finding newest LinkedIn export...');
      extractedDir = await linkedInExportFinder.findNewestExport();
    }
    
    // Validate the LinkedIn export directory
    await validateLinkedInExportDirectory(extractedDir);
    
    console.log('🚀 Starting resume generation...');
    const { jsonPath, htmlPath, pdfPath } = await generator.run(extractedDir, outputDir);
    
    console.log('✅ Resume generated successfully!');
    console.log('📄 JSON:', jsonPath);
    console.log('🌐 HTML:', htmlPath);
    console.log('📋 PDF:', pdfPath);
    
  } catch (err: any) {
    console.error('❌ Resume generation failed:');
    
    // Use centralized error message resolution
    const { message, suggestions } = resolveErrorMessage(err);
    console.error(`   ${message}`);
    
    if (suggestions.length > 0) {
      console.error('   💡 To fix this:');
      suggestions.forEach(suggestion => {
        console.error(`      ${suggestion}`);
      });
    }
    
    process.exit(1);
  }
}

main(); 