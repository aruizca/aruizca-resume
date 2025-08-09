import { Router } from 'express';
import { CoverLetterGenerator } from '@aruizca-resume/core';

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
