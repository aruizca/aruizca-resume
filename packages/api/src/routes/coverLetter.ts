import { Router } from 'express';
import { 
  CoverLetterGenerator, 
  CoverLetterHtmlExporter, 
  CoverLetterPdfExporter
} from '@aruizca-resume/core';
import { validateCoverLetterRequest } from '../middleware/validation.js';

const router = Router();

// Initialize cover letter generator and exporters
const coverLetterGenerator = new CoverLetterGenerator();
const htmlExporter = new CoverLetterHtmlExporter();
const pdfExporter = new CoverLetterPdfExporter();

/**
 * POST /api/cover-letter/generate
 * Generate a cover letter from resume and job URL
 */
router.post('/generate', validateCoverLetterRequest, async (req, res, next) => {
  try {
    const { resume, jobUrl, forceRefresh, wordCount, additionalConsiderations } = req.body;

    if (!resume || !jobUrl) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide both resume and jobUrl'
      });
    }

    const useForceRefresh = forceRefresh === 'true' || forceRefresh === true;

    console.log(`📝 Generating cover letter for job: ${jobUrl} (wordCount: ${wordCount}, additionalConsiderations: ${additionalConsiderations ? 'provided' : 'none'})`);

    // Generate cover letter using the core service with all parameters
    const result = await coverLetterGenerator.generateFromResumeAndUrl(
      resume,
      jobUrl,
      useForceRefresh,
      { wordCount, additionalConsiderations }
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
 * POST /api/cover-letter/generate-from-job-offer
 * Generate a cover letter from resume and job offer object (bypasses URL scraping)
 */
router.post('/generate-from-job-offer', async (req, res, next) => {
  try {
    const { resume, jobOffer, wordCount, additionalConsiderations } = req.body;

    if (!resume || !jobOffer) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Please provide both resume and jobOffer'
      });
    }

    console.log(`📝 Generating cover letter from job offer (wordCount: ${wordCount}, additionalConsiderations: ${additionalConsiderations ? 'provided' : 'none'})`);

    // Generate cover letter using the core service with all parameters
    const result = await coverLetterGenerator.generateFromResumeAndJobOffer(
      resume,
      jobOffer,
      { wordCount, additionalConsiderations }
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
 * POST /api/cover-letter/export/html
 * Export a cover letter to HTML format using the core exporter
 */
router.post('/export/html', async (req, res, next) => {
  try {
    const { coverLetter } = req.body;
    
    if (!coverLetter) {
      return res.status(400).json({
        error: 'No cover letter provided',
        message: 'Please provide coverLetter object in the request body'
      });
    }

    console.log(`📄 Exporting cover letter to HTML...`);

    try {
      // Use the core HTML exporter
      const html = await htmlExporter.export(coverLetter);
      
      const filename = `cover-letter-${new Date().toISOString().split('T')[0]}.html`;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(html);
      
    } catch (exportError) {
      console.error('HTML export error:', exportError);
      res.status(500).json({
        error: 'HTML export failed',
        message: exportError instanceof Error ? exportError.message : 'Unknown export error'
      });
    }
    
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cover-letter/export/pdf
 * Export a cover letter to PDF format using the core exporter
 */
router.post('/export/pdf', async (req, res, next) => {
  try {
    const { coverLetter, pdfOptions } = req.body;
    
    if (!coverLetter) {
      return res.status(400).json({
        error: 'No cover letter provided',
        message: 'Please provide coverLetter object in the request body'
      });
    }

    console.log(`📄 Exporting cover letter to PDF...`);

    try {
      // Use the core PDF exporter with optional PDF options
      const pdfBuffer = await pdfExporter.export(coverLetter, pdfOptions);
      
      const filename = `cover-letter-${new Date().toISOString().split('T')[0]}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
      
    } catch (exportError) {
      console.error('PDF export error:', exportError);
      res.status(500).json({
        error: 'PDF export failed',
        message: exportError instanceof Error ? exportError.message : 'Unknown export error'
      });
    }
    
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