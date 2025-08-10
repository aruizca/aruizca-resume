import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for resume generation requests
 */
export const validateResumeRequest = (req: Request, res: Response, next: NextFunction) => {
  // For file uploads, the file will be available in req.file
  if (!req.file) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'LinkedIn export file is required'
    });
  }

  // Validate file type (should be a zip file)
  if (!req.file.mimetype.includes('zip') && !req.file.originalname.endsWith('.zip')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'LinkedIn export must be a ZIP file'
    });
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: 'File too large',
      message: 'LinkedIn export file must be less than 50MB'
    });
  }

  next();
};

/**
 * Validation middleware for cover letter generation requests
 */
export const validateCoverLetterRequest = (req: Request, res: Response, next: NextFunction) => {
  const { resume, jobUrl, forceRefresh, wordCount, additionalConsiderations } = req.body;

  // Validate required fields
  if (!resume) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'resume is required'
    });
  }

  if (!jobUrl) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'jobUrl is required'
    });
  }

  // Validate jobUrl format
  try {
    new URL(jobUrl);
  } catch {
    return res.status(400).json({
      error: 'Invalid URL format',
      message: 'jobUrl must be a valid URL'
    });
  }

  // Validate wordCount if provided
  if (wordCount !== undefined) {
    const num = Number(wordCount);
    if (isNaN(num) || num < 100 || num > 2000) {
      return res.status(400).json({
        error: 'Invalid word count',
        message: 'wordCount must be a number between 100 and 2000'
      });
    }
  }

  next();
};
