import { describe, it, expect, beforeEach } from 'vitest';
import { ResumeBuilder, Resume } from '../../../../../main';

describe('ResumeBuilder', () => {
  let builder: ResumeBuilder;

  beforeEach(() => {
    builder = new ResumeBuilder();
  });

  describe('build', () => {
    it('should build resume from valid data', () => {
      const mockData: Resume = {
        basics: {
          name: 'John Doe',
          label: 'Software Engineer',
          email: 'john@example.com',
          phone: '+1234567890',
          url: 'https://johndoe.com',
          summary: 'Experienced software engineer',
          location: {
            address: '123 Main St',
            city: 'New York',
            region: 'NY',
            countryCode: 'US',
            postalCode: '10001'
          },
          profiles: [
            {
              network: 'GitHub',
              username: 'johndoe',
              url: 'https://github.com/johndoe'
            }
          ]
        },
        work: [
          {
            name: 'Tech Company',
            position: 'Senior Software Engineer',
            url: 'https://techcompany.com',
            startDate: '2020-01',
            endDate: '2023-12',
            summary: 'Led development of key features',
            highlights: ['Feature A', 'Feature B']
          }
        ],
        education: [
          {
            institution: 'University of Technology',
            url: 'https://university.edu',
            area: 'Computer Science',
            studyType: 'Bachelor',
            startDate: '2016-09',
            endDate: '2020-05',
            score: '3.8/4.0',
            courses: ['Data Structures', 'Algorithms']
          }
        ],
        skills: [
          {
            name: 'JavaScript',
            level: 'Expert',
            keywords: ['React', 'Node.js', 'TypeScript']
          }
        ]
      };

      const result = builder.build(mockData);

      expect(result).toEqual(mockData);
      expect(result.basics.name).toBe('John Doe');
      expect(result.work).toHaveLength(1);
      expect(result.education).toHaveLength(1);
      expect(result.skills).toHaveLength(1);
    });

    it('should handle minimal data', () => {
      const minimalData = {
        basics: {
          name: 'Jane Smith'
        }
      };

      const result = builder.build(minimalData);

      expect(result).toEqual(minimalData);
      expect(result.basics.name).toBe('Jane Smith');
    });

    it('should handle empty arrays', () => {
      const dataWithEmptyArrays = {
        basics: {
          name: 'Test User'
        },
        work: [],
        education: [],
        skills: []
      };

      const result = builder.build(dataWithEmptyArrays);

      expect(result).toEqual(dataWithEmptyArrays);
      expect(result.work).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual([]);
    });

    it('should handle missing optional fields', () => {
      const dataWithMissingFields = {
        basics: {
          name: 'Test User'
          // Missing optional fields like email, phone, etc.
        }
      };

      const result = builder.build(dataWithMissingFields);

      expect(result).toEqual(dataWithMissingFields);
      expect(result.basics.name).toBe('Test User');
      expect(result.basics.email).toBeUndefined();
    });

    it('should preserve all data structure', () => {
      const complexData = {
        basics: {
          name: 'Complex User',
          profiles: [
            { network: 'LinkedIn', username: 'complexuser' },
            { network: 'Twitter', username: '@complexuser' }
          ]
        },
        work: [
          {
            name: 'Company A',
            position: 'Engineer',
            highlights: ['Achievement 1', 'Achievement 2']
          },
          {
            name: 'Company B',
            position: 'Senior Engineer',
            highlights: ['Achievement 3']
          }
        ],
        skills: [
          { name: 'Skill 1', level: 'Expert' },
          { name: 'Skill 2', level: 'Intermediate' }
        ]
      };

      const result = builder.build(complexData);

      expect(result).toEqual(complexData);
      expect(result.basics.profiles).toHaveLength(2);
      expect(result.work).toHaveLength(2);
      expect(result.skills).toHaveLength(2);
    });
  });
}); 