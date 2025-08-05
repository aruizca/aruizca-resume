#!/usr/bin/env node

import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generatePdfWithPlaywright(htmlPath, pdfPath) {
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

function cleanHtmlForPdf(html) {
  // Remove or modify the title to prevent it from appearing in PDF metadata
  // This is the only change we keep - it successfully removed the name
  let cleanHtml = html.replace(/<title>.*?<\/title>/gi, '<title></title>');
  

  

  
  return cleanHtml;
}

async function main() {
  const htmlPath = process.argv[2];
  
  if (!htmlPath) {
    console.error('Usage: node playwright-pdf.js <html-file>');
    process.exit(1);
  }
  
  try {
    console.log(`📄 Generating PDF from HTML: ${htmlPath}`);
    
    // Read the HTML file
    const html = await readFile(htmlPath, 'utf-8');
    
    // Create output directory
    const outputDir = join(process.cwd(), 'output');
    await mkdir(outputDir, { recursive: true });
    
    // Generate output filename
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const pdfPath = join(outputDir, `resume-${date}.pdf`);
    
    // Clean HTML
    const cleanHtml = cleanHtmlForPdf(html);
    
    // Write HTML to temporary file
    const tempHtmlPath = join(outputDir, 'temp-resume.html');
    await writeFile(tempHtmlPath, cleanHtml);
    
    try {
      console.log(`🔧 Trying Playwright with displayHeaderFooter: false...`);
      await generatePdfWithPlaywright(tempHtmlPath, pdfPath);
      console.log(`✅ PDF generated using Playwright: ${pdfPath}`);
    } catch (playwrightError) {
      console.log(`⚠️  Playwright failed: ${playwrightError.message}`);
      console.log(`⚠️  This might be due to bundling issues. Please run: npx playwright install chromium`);
      process.exit(1);
    }
    
    // Clean up temporary HTML file
    try {
      await execAsync(`rm "${tempHtmlPath}"`);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`PDF: ${pdfPath}`);
    
  } catch (error) {
    console.error(`❌ Error generating PDF: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error); 