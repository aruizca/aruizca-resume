#!/usr/bin/env node

import { GenerateCoverLetter } from '../service/GenerateCoverLetter';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🔍 Validating environment...');
  
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const forceRefresh = args.includes('--force-refresh');
  const filteredArgs = args.filter(arg => arg !== '--force-refresh');
  
  if (filteredArgs.length < 2) {
    console.error('❌ Usage: node cover-letter.js <json-resume-path> <job-posting-url> [--test-html <html-file>] [--force-refresh]');
    console.error('   Example: node cover-letter.js ./resume/resume-20250807.json https://example.com/job');
    console.error('   Test mode: node cover-letter.js ./resume/resume-20250807.json https://example.com/job --test-html ./test-job-posting.html');
    console.error('   Force refresh: node cover-letter.js ./resume/resume-20250807.json https://example.com/job --force-refresh');
    process.exit(1);
  }

  const [jsonResumePath, jobPostingUrl, ...remainingArgs] = filteredArgs;
  
  // Check for test mode
  const testHtmlIndex = remainingArgs.indexOf('--test-html');
  const testHtmlPath = testHtmlIndex !== -1 ? remainingArgs[testHtmlIndex + 1] : null;

  // Validate JSON resume file
  console.log(`📄 Validating JSON resume file: ${jsonResumePath}`);
  if (!existsSync(jsonResumePath)) {
    console.error(`❌ JSON resume file not found: ${jsonResumePath}`);
    process.exit(1);
  }

  // Validate test HTML file if provided
  if (testHtmlPath && !existsSync(testHtmlPath)) {
    console.error(`❌ Test HTML file not found: ${testHtmlPath}`);
    process.exit(1);
  }

  console.log('🚀 Starting cover letter generation...');
  console.log(`📄 JSON Resume: ${jsonResumePath}`);
  console.log(`🔗 Job Posting URL: ${jobPostingUrl}`);
  if (testHtmlPath) {
    console.log(`🧪 Test HTML File: ${testHtmlPath}`);
  }
  if (forceRefresh) {
    console.log('🔄 Force refresh enabled - bypassing job posting cache');
  }
  console.log(`📁 Output Directory: ${join(process.cwd(), 'output')}`);

  try {
    const generator = new GenerateCoverLetter();
    
    if (testHtmlPath) {
      // Test mode: use local HTML file
      console.log('🧪 Running in test mode with local HTML file...');
      const result = await generator.runWithTestHtml(jsonResumePath, jobPostingUrl, testHtmlPath, join(process.cwd(), 'output'));
      
      if (result.success) {
        console.log('✅ Cover letter generated successfully in test mode!');
      } else {
        console.error('❌ Cover letter generation failed:');
        console.error(`   ${result.error}`);
        process.exit(1);
      }
    } else {
      // Normal mode: scrape from URL
      const result = await generator.runWithJsonResume(jsonResumePath, jobPostingUrl, join(process.cwd(), 'output'), forceRefresh);
      
      if (result.success) {
        console.log('✅ Cover letter generated successfully!');
      } else {
        console.error('❌ Cover letter generation failed:');
        console.error(`   ${result.error}`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main(); 