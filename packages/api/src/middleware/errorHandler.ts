import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'APIError') {
    statusCode = 502;
    message = 'External API error';
    details = error.message;
  } else if (error.name === 'LinkedInParseError') {
    statusCode = 400;
    message = 'LinkedIn export parsing failed';
    details = error.message;
  } else if (error.message.includes('ENOENT') || error.message.includes('file not found')) {
    statusCode = 400;
    message = 'File not found or invalid file format';
  } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
    statusCode = 429;
    message = 'Rate limit exceeded, please try again later';
  }

  const response: any = {
    error: message,
    timestamp: new Date().toISOString()
  };

  if (details) {
    response.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}
