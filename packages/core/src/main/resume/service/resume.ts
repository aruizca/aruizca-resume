import { GenerateResume, LinkedInExportFinder } from '../index';
import { validateEnvironment, validateLinkedInExportDirectory, validateOutputDirectory, validateCommandLineArgs, resolveErrorMessage } from '../../shared';
import { join } from 'path';

async function main() {
  try {
    // Validate environment and inputs
    console.log('🔍 Validating environment and inputs...');
    await validateEnvironment();
    
    const outputDir = join(process.cwd(), 'output');
    await validateOutputDirectory(outputDir);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const forceRefresh = args.includes('--force-refresh');
    const filteredArgs = args.filter(arg => arg !== '--force-refresh');
    
    validateCommandLineArgs(filteredArgs);
    
    const linkedInExportFinder = new LinkedInExportFinder();
    const generator = new GenerateResume();
    
    // Use command line argument if provided, otherwise find newest export
    let extractedDir: string;
    if (filteredArgs.length > 0) {
      extractedDir = filteredArgs[0];
      console.log(`📁 Using custom LinkedIn export path: ${extractedDir}`);
    } else {
      console.log('📁 Finding newest LinkedIn export...');
      extractedDir = await linkedInExportFinder.findNewestExport();
    }
    
    // Validate the LinkedIn export directory
    await validateLinkedInExportDirectory(extractedDir);
    
    if (forceRefresh) {
      console.log('🔄 Force refresh enabled - bypassing cache');
    }
    
    console.log('🚀 Starting resume generation...');
    const { jsonPath, htmlPath, pdfPath } = await generator.run(extractedDir, outputDir, forceRefresh);
    
    console.log('✅ Resume generated successfully!');
    console.log('📄 JSON:', jsonPath);
    console.log('🌐 HTML:', htmlPath);
    console.log('📋 PDF:', pdfPath);
    
    // Show cache statistics
    const cacheStats = await generator.getCacheStats();
    console.log(`📊 Cache stats: ${cacheStats.totalEntries} entries, ${(cacheStats.totalSize / 1024).toFixed(1)}KB`);
    
    // Show performance summary
    console.log('\n' + generator.getPerformanceSummary());
    
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