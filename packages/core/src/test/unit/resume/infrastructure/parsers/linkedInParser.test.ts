import { join } from 'path';
import Papa from 'papaparse';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile } from 'fs/promises';
import { LinkedInParser } from '../../../../../main/resume';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn()
}));

// Mock papaparse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn()
  }
}));

describe('LinkedInParser', () => {
  let parser: LinkedInParser;
  const mockReadFile = readFile as any;
  const mockPapaParse = Papa.parse as any;

  beforeEach(() => {
    vi.clearAllMocks();
    parser = new LinkedInParser();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('parse', () => {
    it('should parse all CSV files successfully', async () => {
      const mockCsvData = {
        profile: 'name,headline,location\nJohn Doe,Software Engineer,New York',
        positions: 'title,company,startDate\nSoftware Engineer,Company A,2020-01',
        education: 'school,degree,fieldOfStudy\nUniversity A,Bachelor,Computer Science',
        skills: 'name,level\nJavaScript,Expert\nPython,Intermediate'
      };

      const mockParsedData = {
        profile: [{ name: 'John Doe', headline: 'Software Engineer', location: 'New York' }],
        positions: [{ title: 'Software Engineer', company: 'Company A', startDate: '2020-01' }],
        education: [{ school: 'University A', degree: 'Bachelor', fieldOfStudy: 'Computer Science' }],
        skills: [{ name: 'JavaScript', level: 'Expert' }, { name: 'Python', level: 'Intermediate' }]
      };

      // Mock file reads
      mockReadFile.mockResolvedValueOnce(mockCsvData.profile);
      mockReadFile.mockResolvedValueOnce(mockCsvData.positions);
      mockReadFile.mockResolvedValueOnce(mockCsvData.education);
      mockReadFile.mockResolvedValueOnce(mockCsvData.skills);

      // Mock Papa.parse calls
      mockPapaParse.mockReturnValueOnce({ data: mockParsedData.profile });
      mockPapaParse.mockReturnValueOnce({ data: mockParsedData.positions });
      mockPapaParse.mockReturnValueOnce({ data: mockParsedData.education });
      mockPapaParse.mockReturnValueOnce({ data: mockParsedData.skills });

      const result = await parser.parse('test-dir');

      expect(result).toEqual({
        profile: mockParsedData.profile,
        positions: mockParsedData.positions,
        education: mockParsedData.education,
        skills: mockParsedData.skills
      });

      expect(mockReadFile).toHaveBeenCalledTimes(4);
      expect(mockReadFile).toHaveBeenCalledWith(join('test-dir', 'Profile.csv'), 'utf8');
      expect(mockReadFile).toHaveBeenCalledWith(join('test-dir', 'Positions.csv'), 'utf8');
      expect(mockReadFile).toHaveBeenCalledWith(join('test-dir', 'Education.csv'), 'utf8');
      expect(mockReadFile).toHaveBeenCalledWith(join('test-dir', 'Skills.csv'), 'utf8');
    });

    it('should handle missing CSV files', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('ENOENT: no such file or directory'));

      await expect(parser.parse('test-dir')).rejects.toThrow('ENOENT: no such file or directory');
    });

    it('should handle empty CSV files', async () => {
      const emptyCsv = '';
      const emptyData: any[] = [];

      mockReadFile.mockResolvedValue(emptyCsv);
      mockPapaParse.mockReturnValue({ data: emptyData });

      const result = await parser.parse('test-dir');

      expect(result.profile).toEqual([]);
      expect(result.positions).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual([]);
    });

    it('should handle malformed CSV data', async () => {
      const malformedCsv = 'invalid,csv,data\nwith,wrong,format';
      const parsedData = [{ invalid: 'data' }];

      mockReadFile.mockResolvedValue(malformedCsv);
      mockPapaParse.mockReturnValue({ data: parsedData });

      const result = await parser.parse('test-dir');

      expect(result.profile).toEqual(parsedData);
      expect(result.positions).toEqual(parsedData);
      expect(result.education).toEqual(parsedData);
      expect(result.skills).toEqual(parsedData);
    });

    it('should use correct Papa.parse options', async () => {
      const mockCsv = 'header1,header2\nvalue1,value2';
      const mockData = [{ header1: 'value1', header2: 'value2' }];

      mockReadFile.mockResolvedValue(mockCsv);
      mockPapaParse.mockReturnValue({ data: mockData });

      await parser.parse('test-dir');

      expect(mockPapaParse).toHaveBeenCalledWith(mockCsv, { header: true });
    });
  });
}); 