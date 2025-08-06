import { access, readdir } from 'fs/promises';
import { join } from 'path';
import { ValidationError, FileSystemError } from './errors';

export async function validateEnvironment(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ValidationError(
      'OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.',
      { code: 'MISSING_API_KEY' }
    );
  }
  
  if (apiKey.length < 20) {
    throw new ValidationError(
      'OpenAI API key appears to be invalid. Please check your OPENAI_API_KEY environment variable.',
      { code: 'INVALID_API_KEY' }
    );
  }
}

export async function validateLinkedInExportDirectory(exportDir: string): Promise<void> {
  try {
    await access(exportDir);
  } catch (error) {
    throw new FileSystemError(
      `LinkedIn export directory not found: ${exportDir}. Please place your LinkedIn export ZIP file in the 'linkedin-export' folder.`,
      { code: 'LINKEDIN_DIR_NOT_FOUND', path: exportDir }
    );
  }

  const files = await readdir(exportDir);
  const zipFiles = files.filter(file => 
    file.startsWith('Basic_LinkedInDataExport_') && file.endsWith('.zip')
  );

  if (zipFiles.length === 0) {
    throw new FileSystemError(
      `No LinkedIn export ZIP files found in ${exportDir}. Please ensure you have exported your LinkedIn data and placed the ZIP file in the 'linkedin-export' folder.`,
      { code: 'NO_LINKEDIN_EXPORTS', path: exportDir, availableFiles: files }
    );
  }
}

export async function validateOutputDirectory(outputDir: string): Promise<void> {
  try {
    await access(outputDir);
  } catch (error) {
    // Output directory doesn't exist, try to create it
    try {
      const { mkdir } = await import('fs/promises');
      await mkdir(outputDir, { recursive: true });
    } catch (createError) {
      throw new FileSystemError(
        `Cannot create output directory: ${outputDir}. Please check your permissions.`,
        { code: 'OUTPUT_DIR_CREATE_FAILED', path: outputDir }
      );
    }
  }

  // Test write access
  try {
    const testFile = join(outputDir, '.test-write');
    const { writeFile, unlink } = await import('fs/promises');
    await writeFile(testFile, 'test');
    await unlink(testFile);
  } catch (error) {
    throw new FileSystemError(
      `Output directory is not writable: ${outputDir}. Please check your permissions.`,
      { code: 'OUTPUT_DIR_NOT_WRITABLE', path: outputDir }
    );
  }
}

export function validateCommandLineArgs(args: string[]): void {
  if (args.length > 0) {
    const customPath = args[0];
    if (!customPath.startsWith('/') && !customPath.startsWith('./') && !customPath.startsWith('../')) {
      throw new ValidationError(
        `Invalid path format: ${customPath}. Please provide an absolute path or relative path starting with ./ or ../`,
        { code: 'INVALID_PATH_FORMAT', path: customPath }
      );
    }
  }
} 