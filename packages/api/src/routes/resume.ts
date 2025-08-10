import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ResumeGenerator, ExporterFactory } from '@aruizca-resume/core';
import { validateResumeRequest } from '../middleware/validation.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store uploaded files in a temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\.zip$/, '');
    cb(null, `${originalName}-${timestamp}.zip`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept zip files
    if (file.mimetype.includes('zip') || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

// Get exporter factory instance
const exporterFactory = ExporterFactory.getInstance();

/**
 * POST /api/resume/generate
 * Generate a resume from LinkedIn export file
 */
router.post('/generate', upload.single('linkedinExport'), validateResumeRequest, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { forceRefresh } = req.body;
    const useForceRefresh = forceRefresh === 'true' || forceRefresh === true;
    
    console.log(`🚀 Starting resume generation for file: ${req.file.originalname}`);
    console.log(`📁 File path: ${req.file.path}`);
    console.log(`🔄 Force refresh: ${useForceRefresh}`);

    // Read the file into a buffer
    const fileBuffer = fs.readFileSync(req.file.path);

    // Generate resume using the core service
    const resumeGenerator = new ResumeGenerator();
    const result = await resumeGenerator.generateFromZip(fileBuffer, useForceRefresh);

    if (!result.success || !result.resume) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate resume',
        message: result.error || 'Resume generation failed'
      });
    }

    console.log('✅ Resume generation successful!');

    // Clean up the uploaded file
    try {
      fs.unlinkSync(req.file.path);
      console.log(`🗑️ Cleaned up temporary file: ${req.file.path}`);
    } catch (cleanupError) {
      console.warn(`⚠️ Failed to clean up temporary file: ${req.file.path}`, cleanupError);
    }

    // Return the JSON resume data
    res.json({
      success: true,
      resume: result.resume,
      performance: result.performance
    });

  } catch (error: any) {
    console.error('❌ Resume generation error:', error);
    
    // Clean up the uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Cleaned up temporary file after error: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to clean up temporary file after error: ${req.file.path}`, cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate resume',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/resume/formats
 * Get available export formats
 */
router.get('/formats', (req, res) => {
  res.json({
    formats: [
      { id: 'json', name: 'JSON Resume', description: 'Structured resume data in JSON format' },
      { id: 'html', name: 'HTML', description: 'Formatted resume in HTML format' },
      { id: 'pdf', name: 'PDF', description: 'Printable resume in PDF format' }
    ]
  });
});

export { router as resumeRouter };
