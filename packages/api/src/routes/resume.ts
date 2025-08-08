import { Router } from 'express';
import multer from 'multer';
import { ResumeGenerator } from '@aruizca-resume/core';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize resume generator
const resumeGenerator = new ResumeGenerator();

/**
 * POST /api/resume/generate
 * Generate a JSON resume from LinkedIn export ZIP file
 */
router.post('/generate', upload.single('linkedinExport'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No LinkedIn export file provided',
        message: 'Please upload a LinkedIn export ZIP file' 
      });
    }

    const { forceRefresh } = req.body;
    const useForceRefresh = forceRefresh === 'true' || forceRefresh === true;

    console.log(`📁 Processing LinkedIn export: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Generate resume using the core service
    const result = await resumeGenerator.generateFromZip(
      req.file.buffer,
      useForceRefresh
    );

    if (result.success && result.resume) {
      res.json({
        success: true,
        resume: result.resume,
        performance: result.performance,
        validationResult: result.validationResult
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Resume generation failed'
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resume/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', async (req, res, next) => {
  try {
    const stats = await resumeGenerator.getCacheStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/resume/cache
 * Clear the cache
 */
router.delete('/cache', async (req, res, next) => {
  try {
    await resumeGenerator.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/resume/performance
 * Get performance statistics
 */
router.get('/performance', (req, res) => {
  const stats = resumeGenerator.getPerformanceStats();
  const summary = resumeGenerator.getPerformanceSummary();
  res.json({ stats, summary });
});

export { router as resumeRouter };
