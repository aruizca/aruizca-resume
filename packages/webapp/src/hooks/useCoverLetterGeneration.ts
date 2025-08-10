import { useState } from 'react';
import { createMockCoverLetter } from '../utils/mockData';

export interface CoverLetterFormData {
  resumeFile: File | null;
  jobUrl: string;
  wordCount?: number;
  additionalConsiderations?: string;
  useCache?: boolean;
}

export interface UseCoverLetterGenerationReturn {
  formData: CoverLetterFormData;
  generatedCoverLetter: string;
  isGenerating: boolean;
  handleFormSubmit: (data: CoverLetterFormData) => Promise<void>;
}

/**
 * Custom hook for managing cover letter generation state and logic
 */
export const useCoverLetterGeneration = (): UseCoverLetterGenerationReturn => {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    resumeFile: null,
    jobUrl: '',
    wordCount: 300,
    additionalConsiderations: '',
    useCache: true,
  });
  
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFormSubmit = async (data: CoverLetterFormData) => {
    setIsGenerating(true);
    setFormData(data);
    
    try {
      // Read the resume file as JSON
      if (!data.resumeFile) {
        throw new Error('Resume file is required');
      }
      
      const resumeText = await data.resumeFile.text();
      const resumeJson = JSON.parse(resumeText);
      
      // Call the real API
      const apiUrl = ''; // Use relative URLs for unified server
      const response = await fetch(`${apiUrl}/api/cover-letter/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume: resumeJson,
          jobUrl: data.jobUrl,
          forceRefresh: !data.useCache,
          wordCount: data.wordCount,
          additionalConsiderations: data.additionalConsiderations
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.coverLetter) {
        setGeneratedCoverLetter(result.coverLetter.content || result.coverLetter);
      } else {
        throw new Error(result.error || 'Cover letter generation failed');
      }
      
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      // Fall back to mock data in case of error during development
      const mockCoverLetter = createMockCoverLetter(
        data.useCache || true,
        data.wordCount,
        `Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Showing mock data.`
      );
      setGeneratedCoverLetter(mockCoverLetter);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    formData,
    generatedCoverLetter,
    isGenerating,
    handleFormSubmit
  };
};
