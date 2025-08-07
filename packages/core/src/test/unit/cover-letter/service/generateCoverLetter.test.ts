import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateCoverLetter } from '../../../../main/cover-letter/service';
import { JobOffer, CoverLetter, CoverLetterBuilder } from '../../../../main/cover-letter/domain';
import { JobOfferScraper, CoverLetterPromptRunner, CoverLetterRenderer } from '../../../../main/cover-letter/infrastructure';
import { LinkedInParser } from '../../../../main/resume';

// Mock the fetch function
global.fetch = vi.fn();

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn()
}));

describe('GenerateCoverLetter', () => {
  let generateCoverLetter: GenerateCoverLetter;
  let mockJobOfferScraper: any;
  let mockPromptRunner: any;
  let mockCoverLetterRenderer: any;
  let mockCoverLetterBuilder: any;
  let mockLinkedInParser: any;

  beforeEach(() => {
    // Create mocks
    mockJobOfferScraper = {
      scrape: vi.fn()
    } as any;

    mockPromptRunner = {
      run: vi.fn(),
      runWithJson: vi.fn(),
      extractJobInfoFromHtml: vi.fn()
    } as any;

    mockCoverLetterRenderer = {
      renderToMarkdown: vi.fn(),
      renderToText: vi.fn()
    } as any;

    mockCoverLetterBuilder = {
      build: vi.fn()
    } as any;

    mockLinkedInParser = {
      parse: vi.fn()
    } as any;

    // Create the service with mocked dependencies
    generateCoverLetter = new GenerateCoverLetter(
      mockJobOfferScraper,
      mockPromptRunner,
      mockCoverLetterRenderer,
      mockCoverLetterBuilder,
      mockLinkedInParser
    );
  });

  it('should successfully generate a cover letter with JSON inputs', async () => {
    // Mock data
    const mockJobOffer: JobOffer = {
      url: 'https://example.com/job',
      title: 'Software Engineer',
      company: 'Example Corp',
      description: 'A great job opportunity',
      requirements: ['JavaScript', 'TypeScript'],
      responsibilities: ['Develop applications'],
      scrapedAt: new Date()
    };

    const mockResumeJson = JSON.stringify({
      basics: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      work: [
        {
          company: 'Tech Corp',
          position: 'Developer',
          startDate: '2020-01',
          endDate: '2023-01'
        }
      ]
    });

    const mockCoverLetterMarkdown = `# Cover Letter

Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at Example Corp...

Sincerely,
John Doe`;

    // Setup mocks
    mockJobOfferScraper.scrape.mockResolvedValue({
      success: true,
      jobOffer: mockJobOffer
    });

    mockPromptRunner.runWithJson.mockResolvedValue(mockCoverLetterMarkdown);

    // Mock the resume directory read
    const { readdir, readFile } = await import('fs/promises');
    (readdir as any).mockResolvedValue(['resume-20250807.json']);
    (readFile as any).mockResolvedValue(mockResumeJson);

    // Execute
    const result = await generateCoverLetter.run(
      'https://example.com/job',
      '/path/to/linkedin-export',
      '/path/to/output'
    );

    // Assertions
    expect(result.success).toBe(true);
    expect(result.coverLetter).toBeDefined();
    expect(mockJobOfferScraper.scrape).toHaveBeenCalledWith('https://example.com/job');
    expect(mockPromptRunner.runWithJson).toHaveBeenCalledWith(
      JSON.stringify(mockJobOffer, null, 2),
      mockResumeJson
    );
  });

  it('should handle job scraping failure', async () => {
    // Setup mock to return failure
    mockJobOfferScraper.scrape.mockResolvedValue({
      success: false,
      error: 'Failed to scrape job offer'
    });

    // Execute
    const result = await generateCoverLetter.run(
      'https://example.com/job',
      '/path/to/linkedin-export',
      '/path/to/output'
    );

    // Assertions
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to scrape job offer');
  });

  it('should handle missing JSON resume files', async () => {
    // Setup mocks
    mockJobOfferScraper.scrape.mockResolvedValue({
      success: true,
      jobOffer: {
        url: 'https://example.com/job',
        title: 'Software Engineer',
        company: 'Example Corp',
        description: 'A great job opportunity',
        requirements: ['JavaScript'],
        responsibilities: ['Develop applications'],
        scrapedAt: new Date()
      }
    });

    // Mock empty resume directory
    const { readdir } = await import('fs/promises');
    (readdir as any).mockResolvedValue([]);

    // Execute
    const result = await generateCoverLetter.run(
      'https://example.com/job',
      '/path/to/linkedin-export',
      '/path/to/output'
    );

    // Assertions
    expect(result.success).toBe(false);
    expect(result.error).toContain('No JSON resume files found');
  });

  it('should successfully generate a cover letter with JSON resume path', async () => {
    // Mock data
    const mockJobOffer: JobOffer = {
      url: 'https://example.com/job',
      title: 'Software Engineer',
      company: 'Example Corp',
      description: 'A great job opportunity',
      requirements: ['JavaScript', 'TypeScript'],
      responsibilities: ['Develop applications'],
      scrapedAt: new Date()
    };

    const mockResumeJson = JSON.stringify({
      basics: {
        name: 'John Doe',
        email: 'john@example.com'
      },
      work: [
        {
          company: 'Tech Corp',
          position: 'Developer',
          startDate: '2020-01',
          endDate: '2023-01'
        }
      ]
    });

    const mockCoverLetterMarkdown = `# Cover Letter

Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at Example Corp...

Sincerely,
John Doe`;

    // Setup mocks
    mockJobOfferScraper.scrape.mockResolvedValue({
      success: true,
      jobOffer: mockJobOffer
    });

    mockPromptRunner.runWithJson.mockResolvedValue(mockCoverLetterMarkdown);

    // Mock file system operations
    const { readFile, writeFile, mkdir } = await import('fs/promises');
    (readFile as any).mockResolvedValue(mockResumeJson);
    (writeFile as any).mockResolvedValue(undefined);
    (mkdir as any).mockResolvedValue(undefined);

    // Execute
    const result = await generateCoverLetter.runWithJsonResume(
      '/path/to/resume.json',
      'https://example.com/job',
      '/path/to/output'
    );

    // Assertions
    expect(result.success).toBe(true);
    expect(result.coverLetter).toBeDefined();
    expect(mockJobOfferScraper.scrape).toHaveBeenCalledWith('https://example.com/job');
    expect(mockPromptRunner.runWithJson).toHaveBeenCalledWith(
      JSON.stringify(mockJobOffer, null, 2),
      mockResumeJson
    );
  });
}); 