import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { access, readdir, mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { 
  validateEnvironment, 
  validateLinkedInExportDirectory, 
  validateOutputDirectory, 
  validateCommandLineArgs 
} from '../../../../../main/shared';
import { ValidationError, FileSystemError } from '../../../../../main/shared';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  access: vi.fn(),
  readdir: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn()
}));

describe('Input Validation', () => {
  const mockAccess = access as any;
  const mockReaddir = readdir as any;
  const mockMkdir = mkdir as any;
  const mockWriteFile = writeFile as any;
  const mockUnlink = unlink as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEnvironment', () => {
    it('should pass with valid API key', async () => {
      process.env.OPENAI_API_KEY = 'sk-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      await expect(validateEnvironment()).resolves.not.toThrow();
    });

    it('should throw ValidationError when API key is missing', async () => {
      await expect(validateEnvironment()).rejects.toThrow(ValidationError);
      await expect(validateEnvironment()).rejects.toThrow('OpenAI API key is not set');
    });

    it('should throw ValidationError when API key is too short', async () => {
      process.env.OPENAI_API_KEY = 'sk-123';
      
      await expect(validateEnvironment()).rejects.toThrow(ValidationError);
      await expect(validateEnvironment()).rejects.toThrow('OpenAI API key appears to be invalid');
    });

    it('should include error context for missing API key', async () => {
      try {
        await validateEnvironment();
      } catch (error: any) {
        expect(error.context?.code).toBe('MISSING_API_KEY');
      }
    });

    it('should include error context for invalid API key', async () => {
      process.env.OPENAI_API_KEY = 'sk-123';
      
      try {
        await validateEnvironment();
      } catch (error: any) {
        expect(error.context?.code).toBe('INVALID_API_KEY');
      }
    });
  });

  describe('validateLinkedInExportDirectory', () => {
    it('should pass with valid LinkedIn export directory', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue([
        'Basic_LinkedInDataExport_01-01-2025.zip',
        'other-file.txt'
      ]);

      await expect(validateLinkedInExportDirectory('test-dir')).resolves.not.toThrow();
    });

    it('should throw FileSystemError when directory does not exist', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      await expect(validateLinkedInExportDirectory('nonexistent-dir')).rejects.toThrow(FileSystemError);
      await expect(validateLinkedInExportDirectory('nonexistent-dir')).rejects.toThrow('LinkedIn export directory not found');
    });

    it('should throw FileSystemError when no LinkedIn export files found', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(['other-file.txt', 'document.pdf']);

      await expect(validateLinkedInExportDirectory('test-dir')).rejects.toThrow(FileSystemError);
      await expect(validateLinkedInExportDirectory('test-dir')).rejects.toThrow('No LinkedIn export ZIP files found');
    });

    it('should include error context for missing directory', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));

      try {
        await validateLinkedInExportDirectory('nonexistent-dir');
      } catch (error: any) {
        expect(error.context?.code).toBe('LINKEDIN_DIR_NOT_FOUND');
        expect(error.context?.path).toBe('nonexistent-dir');
      }
    });

    it('should include error context for no exports', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReaddir.mockResolvedValue(['other-file.txt']);

      try {
        await validateLinkedInExportDirectory('test-dir');
      } catch (error: any) {
        expect(error.context?.code).toBe('NO_LINKEDIN_EXPORTS');
        expect(error.context?.path).toBe('test-dir');
        expect(error.context?.availableFiles).toEqual(['other-file.txt']);
      }
    });
  });

  describe('validateOutputDirectory', () => {
    it('should pass with existing writable directory', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);

      await expect(validateOutputDirectory('test-output')).resolves.not.toThrow();
    });

    it('should create directory if it does not exist', async () => {
      mockAccess.mockRejectedValueOnce(new Error('ENOENT'));
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);
      mockUnlink.mockResolvedValue(undefined);

      await expect(validateOutputDirectory('test-output')).resolves.not.toThrow();
      expect(mockMkdir).toHaveBeenCalledWith('test-output', { recursive: true });
    });

    it('should throw FileSystemError when directory creation fails', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockMkdir.mockRejectedValue(new Error('Permission denied'));

      await expect(validateOutputDirectory('test-output')).rejects.toThrow(FileSystemError);
      await expect(validateOutputDirectory('test-output')).rejects.toThrow('Cannot create output directory');
    });

    it('should throw FileSystemError when directory is not writable', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValue(new Error('Permission denied'));

      await expect(validateOutputDirectory('test-output')).rejects.toThrow(FileSystemError);
      await expect(validateOutputDirectory('test-output')).rejects.toThrow('Output directory is not writable');
    });

    it('should include error context for creation failure', async () => {
      mockAccess.mockRejectedValue(new Error('ENOENT'));
      mockMkdir.mockRejectedValue(new Error('Permission denied'));

      try {
        await validateOutputDirectory('test-output');
      } catch (error: any) {
        expect(error.context?.code).toBe('OUTPUT_DIR_CREATE_FAILED');
        expect(error.context?.path).toBe('test-output');
      }
    });

    it('should include error context for write failure', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValue(new Error('Permission denied'));

      try {
        await validateOutputDirectory('test-output');
      } catch (error: any) {
        expect(error.context?.code).toBe('OUTPUT_DIR_NOT_WRITABLE');
        expect(error.context?.path).toBe('test-output');
      }
    });
  });

  describe('validateCommandLineArgs', () => {
    it('should pass with no arguments', () => {
      expect(() => validateCommandLineArgs([])).not.toThrow();
    });

    it('should pass with valid absolute path', () => {
      expect(() => validateCommandLineArgs(['/path/to/export'])).not.toThrow();
    });

    it('should pass with valid relative path starting with ./', () => {
      expect(() => validateCommandLineArgs(['./path/to/export'])).not.toThrow();
    });

    it('should pass with valid relative path starting with ../', () => {
      expect(() => validateCommandLineArgs(['../path/to/export'])).not.toThrow();
    });

    it('should throw ValidationError with invalid path format', () => {
      expect(() => validateCommandLineArgs(['invalid-path'])).toThrow(ValidationError);
      expect(() => validateCommandLineArgs(['invalid-path'])).toThrow('Invalid path format');
    });

    it('should include error context for invalid path', () => {
      try {
        validateCommandLineArgs(['invalid-path']);
      } catch (error: any) {
        expect(error.context?.code).toBe('INVALID_PATH_FORMAT');
        expect(error.context?.path).toBe('invalid-path');
      }
    });
  });
}); 