import { Router } from 'express';
import { CoverLetterGenerator } from '@aruizca-resume/core';
import { chromium } from 'playwright';

const router = Router();

// Initialize cover letter generator
const coverLetterGenerator = new CoverLetterGenerator();

/**
 * POST /api/cover-letter/generate
 * Generate a cover letter from resume and job URL
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { resume, jobUrl, forceRefresh } = req.body;

    if (!resume || !jobUrl) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide both resume and jobUrl'
      });
    }

    const useForceRefresh = forceRefresh === 'true' || forceRefresh === true;

    console.log(`📝 Generating cover letter for job: ${jobUrl}`);

    // Generate cover letter using the core service
    const result = await coverLetterGenerator.generateFromResumeAndUrl(
      resume,
      jobUrl,
      useForceRefresh
    );

    if (result.success && result.coverLetter) {
      res.json({
        success: true,
        coverLetter: result.coverLetter,
        performance: result.performance
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Cover letter generation failed'
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cover-letter/extract-job
 * Extract job information from HTML content
 */
router.post('/extract-job', async (req, res, next) => {
  try {
    const { htmlContent, originalUrl } = req.body;

    if (!htmlContent) {
      return res.status(400).json({
        error: 'Missing HTML content',
        message: 'Please provide htmlContent in the request body'
      });
    }

    const url = originalUrl || 'https://unknown-job-url.com';
    const jobOffer = await coverLetterGenerator.extractJobOfferFromHtml(htmlContent, url);
    res.json({ jobOffer });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cover-letter/export/pdf
 * Export a cover letter (markdown content) to PDF format
 */
router.post('/export/pdf', async (req, res, next) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'No cover letter content provided',
        message: 'Please provide markdown content in the request body'
      });
    }

    console.log(`📄 Exporting cover letter to PDF...`);

    // Convert markdown to HTML
    const markdownToHtml = (markdown: string) => {
      return markdown
        // Remove markdown code block syntax
        .replace(/```[a-z]*\n?/g, '')
        .replace(/```/g, '')
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic  
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Convert double line breaks to paragraphs
        .replace(/\n\n/g, '</p><p>')
        // Convert single line breaks to spaces (for professional formatting)
        .replace(/\n/g, ' ')
        // Wrap in paragraph tags
        .replace(/^(.*)$/, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '');
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cover Letter</title>
        <style>
          body { 
            font-family: system-ui, -apple-system, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            color: #333;
          }
          h1, h2, h3 { 
            color: #333; 
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          h1 { 
            font-size: 1.5rem; 
            border-bottom: 2px solid #333;
            padding-bottom: 0.5em;
          }
          h2 { font-size: 1.25rem; }
          h3 { font-size: 1.1rem; }
          p { 
            margin-bottom: 1rem; 
            text-align: justify; 
          }
          strong { font-weight: bold; }
          em { font-style: italic; }
        </style>
      </head>
      <body>
        ${markdownToHtml(content)}
      </body>
      </html>
    `;

    // Generate PDF using Playwright
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true,
      preferCSSPageSize: false
    });
    
    await browser.close();

    const filename = `cover-letter-${new Date().toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/cover-letter/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', async (req, res, next) => {
  try {
    const stats = await coverLetterGenerator.getCacheStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cover-letter/cache
 * Clear the cache (not implemented for cover letter generator)
 */
router.delete('/cache', async (req, res, next) => {
  try {
    // CoverLetterGenerator doesn't have clearCache method
    res.json({ message: 'Cover letter cache clearing not implemented' });
  } catch (error) {
    next(error);
  }
});

export { router as coverLetterRouter };
