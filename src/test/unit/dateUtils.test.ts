import { describe, it, expect } from 'vitest';

// Helper function to format date as YYYYMMDD
function formatDateForFilename(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

// Helper function to generate date string with prefix
function generateDateString(date: Date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

describe('Date Utils', () => {
  describe('formatDateForFilename', () => {
    it('should format date correctly for single digit month and day', () => {
      const date = new Date('2025-01-05');
      const result = formatDateForFilename(date);
      expect(result).toBe('20250105');
    });

    it('should format date correctly for double digit month and day', () => {
      const date = new Date('2025-12-25');
      const result = formatDateForFilename(date);
      expect(result).toBe('20251225');
    });

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29');
      const result = formatDateForFilename(date);
      expect(result).toBe('20240229');
    });

    it('should handle year boundary dates', () => {
      const date = new Date('2024-12-31');
      const result = formatDateForFilename(date);
      expect(result).toBe('20241231');
    });

    it('should handle current date', () => {
      const now = new Date();
      const result = formatDateForFilename(now);
      const expected = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('generateDateString', () => {
    it('should generate date string with prefix for single digit month and day', () => {
      const date = new Date('2025-01-05');
      const result = generateDateString(date);
      expect(result).toBe('-20250105');
    });

    it('should generate date string with prefix for double digit month and day', () => {
      const date = new Date('2025-12-25');
      const result = generateDateString(date);
      expect(result).toBe('-20251225');
    });

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29');
      const result = generateDateString(date);
      expect(result).toBe('-20240229');
    });

    it('should handle year boundary dates', () => {
      const date = new Date('2024-12-31');
      const result = generateDateString(date);
      expect(result).toBe('-20241231');
    });

    it('should use current date when no date provided', () => {
      const now = new Date();
      const result = generateDateString();
      const expected = `-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('date padding', () => {
    it('should pad single digit numbers correctly', () => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      expect(pad(1)).toBe('01');
      expect(pad(5)).toBe('05');
      expect(pad(9)).toBe('09');
    });

    it('should not pad double digit numbers', () => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      expect(pad(10)).toBe('10');
      expect(pad(25)).toBe('25');
      expect(pad(31)).toBe('31');
    });

    it('should handle zero', () => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      
      expect(pad(0)).toBe('00');
    });
  });
}); 