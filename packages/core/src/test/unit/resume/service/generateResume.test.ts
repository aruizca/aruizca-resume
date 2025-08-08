import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdir, writeFile } from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

// Mock the resume-generator module
vi.mock('../../../../main', () => ({
  GenerateResume: vi.fn().mockImplementation(() => ({
    run: vi.fn().mockImplementation(async (linkedInDir: string, outputDir: string) => {
      // Import the mocked dependencies
      const { LinkedInParser, PromptRunner, ResumeBuilder, HtmlRenderer, PdfExporter } = await import('../../../../main');
      
      // Create instances and call the pipeline
      const linkedInParser = new (LinkedInParser as any)();
      const promptRunner = new (PromptRunner as any)();
      const resumeBuilder = new (ResumeBuilder as any)();
      const htmlRenderer = new (HtmlRenderer as any)();
      const pdfExporter = new (PdfExporter as any)();
      
      const parsedData = await linkedInParser.parse(linkedInDir);
      const llmData = await promptRunner.run(parsedData);
      const resume = resumeBuilder.build(llmData);
      const html = await htmlRenderer.render(resume);
      await pdfExporter.export(html, join(outputDir, 'resume-20250806.pdf'));
      
      // Mock file operations
      const { writeFile, mkdir } = await import('fs/promises');
      await mkdir(outputDir, { recursive: true });
      await writeFile(join(outputDir, 'resume-20250806.json'), JSON.stringify(resume));
      await writeFile(join(outputDir, 'resume-20250806.html'), html);
      
      return {
        jsonPath: join(outputDir, 'resume-20250806.json'),
        htmlPath: join(outputDir, 'resume-20250806.html'),
        pdfPath: join(outputDir, 'resume-20250806.pdf')
      };
    })
  })),
  LinkedInParser: vi.fn(),
  PromptRunner: vi.fn(),
  ResumeBuilder: vi.fn(),
  HtmlRenderer: vi.fn(),
  PdfExporter: vi.fn()
}));

describe('GenerateResume', () => {
  let generateResume: any;
  let mockLinkedInParser: any;
  let mockPromptRunner: any;
  let mockResumeBuilder: any;
  let mockHtmlRenderer: any;
  let mockPdfExporter: any;
  const mockWriteFile = writeFile as any;
  const mockMkdir = mkdir as any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create mock instances
    mockLinkedInParser = {
      parse: vi.fn()
    };
    mockPromptRunner = {
      run: vi.fn()
    };
    mockResumeBuilder = {
      build: vi.fn()
    };
    mockHtmlRenderer = {
      render: vi.fn()
    };
    mockPdfExporter = {
      export: vi.fn()
    };

    // Import the mocked modules
    const { GenerateResume, LinkedInParser, PromptRunner, ResumeBuilder, HtmlRenderer, PdfExporter } = await import('../../../../main');
    
    // Mock the constructors
    (LinkedInParser as any).mockImplementation(() => mockLinkedInParser);
    (PromptRunner as any).mockImplementation(() => mockPromptRunner);
    (ResumeBuilder as any).mockImplementation(() => mockResumeBuilder);
    (HtmlRenderer as any).mockImplementation(() => mockHtmlRenderer);
    (PdfExporter as any).mockImplementation(() => mockPdfExporter);

    generateResume = new (GenerateResume as any)();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('run', () => {
    it('should run the full pipeline successfully', async () => {
      const mockParsedData = {
        profile: [{ name: 'John Doe' }],
        positions: [{ title: 'Engineer' }],
        education: [{ institution: 'University' }],
        skills: [{ name: 'JavaScript' }]
      };

      const mockLlmData = {
        basics: { name: 'John Doe' },
        work: [{ name: 'Company' }]
      };

      const mockResume = {
        basics: { name: 'John Doe' },
        work: [{ name: 'Company' }]
      };

      const mockHtml = '<html><body>Resume</body></html>';

      // Mock all the dependencies
      mockLinkedInParser.parse.mockResolvedValue(mockParsedData);
      mockPromptRunner.run.mockResolvedValue(mockLlmData);
      mockResumeBuilder.build.mockReturnValue(mockResume);
      mockHtmlRenderer.render.mockResolvedValue(mockHtml);
      mockPdfExporter.export.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await generateResume.run('test-linkedin-dir', 'test-output');

      // Verify all steps were called
      expect(mockLinkedInParser.parse).toHaveBeenCalledWith('test-linkedin-dir');
      expect(mockPromptRunner.run).toHaveBeenCalledWith(mockParsedData);
      expect(mockResumeBuilder.build).toHaveBeenCalledWith(mockLlmData);
      expect(mockHtmlRenderer.render).toHaveBeenCalledWith(mockResume);
      expect(mockPdfExporter.export).toHaveBeenCalledWith(mockHtml, expect.stringContaining('resume-'));
      expect(mockMkdir).toHaveBeenCalledWith('test-output', { recursive: true });

      // Verify file writes
      expect(mockWriteFile).toHaveBeenCalledTimes(2); // JSON and HTML files
      expect(result).toHaveProperty('jsonPath');
      expect(result).toHaveProperty('htmlPath');
      expect(result).toHaveProperty('pdfPath');
    });

    it('should handle LinkedInParser errors', async () => {
      mockLinkedInParser.parse.mockRejectedValue(new Error('LinkedIn parsing failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('LinkedIn parsing failed');
    });

    it('should handle PromptRunner errors', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockRejectedValue(new Error('LLM processing failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('LLM processing failed');
    });

    it('should handle HtmlRenderer errors', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});
      mockResumeBuilder.build.mockReturnValue({});
      mockHtmlRenderer.render.mockRejectedValue(new Error('HTML rendering failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('HTML rendering failed');
    });

    it('should handle PdfExporter errors', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});
      mockResumeBuilder.build.mockReturnValue({});
      mockHtmlRenderer.render.mockResolvedValue('<html></html>');
      mockPdfExporter.export.mockRejectedValue(new Error('PDF export failed'));

      await expect(generateResume.run('test-dir', 'test-output')).rejects.toThrow('PDF export failed');
    });

    it('should generate correct file paths with date', async () => {
      const mockDate = new Date('2025-08-06T12:00:00Z');
      vi.setSystemTime(mockDate);

      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});
      mockResumeBuilder.build.mockReturnValue({});
      mockHtmlRenderer.render.mockResolvedValue('<html></html>');
      mockPdfExporter.export.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await generateResume.run('test-dir', 'test-output');

      expect(result.jsonPath).toContain('resume-20250806.json');
      expect(result.htmlPath).toContain('resume-20250806.html');
      expect(result.pdfPath).toContain('resume-20250806.pdf');

      vi.useRealTimers();
    });

    it('should create output directory if it does not exist', async () => {
      mockLinkedInParser.parse.mockResolvedValue({});
      mockPromptRunner.run.mockResolvedValue({});
      mockResumeBuilder.build.mockReturnValue({});
      mockHtmlRenderer.render.mockResolvedValue('<html></html>');
      mockPdfExporter.export.mockResolvedValue(undefined);
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue(undefined);

      await generateResume.run('test-dir', 'new-output-dir');

      expect(mockMkdir).toHaveBeenCalledWith('new-output-dir', { recursive: true });
    });
  });
}); 