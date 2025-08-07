#!/usr/bin/env node

import { GenerateCoverLetter } from './cover-letter-generator/service/GenerateCoverLetter';
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
  
  if (args.length < 2) {
    console.error('❌ Usage: node cover-letter-generator.js <json-resume-path> <job-posting-url> [--test-html <html-file>]');
    console.error('   Example: node cover-letter-generator.js ./resume/resume-20250807.json https://example.com/job');
    console.error('   Test mode: node cover-letter-generator.js ./resume/resume-20250807.json https://example.com/job --test-html ./test-job-posting.html');
    process.exit(1);
  }

  const [jsonResumePath, jobPostingUrl, ...remainingArgs] = args;
  
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
      const result = await generator.runWithJsonResume(jsonResumePath, jobPostingUrl, join(process.cwd(), 'output'));
      
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