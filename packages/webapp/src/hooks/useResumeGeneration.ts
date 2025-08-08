import { useState } from 'react';
// TODO: Fix browser compatibility issues with core package
// import { ResumeGenerator } from '@aruizca-resume/core';
import { createMockJsonResume } from '../utils/mockData';

export interface ResumeGenerationData {
  linkedinExportFile: File;
  useCache: boolean;
}

export interface UseResumeGenerationReturn {
  generatedResume: object | null;
  isGenerating: boolean;
  error: string | null;
  handleResumeSubmit: (data: ResumeGenerationData) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing resume generation state and logic
 */
export const useResumeGeneration = (): UseResumeGenerationReturn => {
  const [generatedResume, setGeneratedResume] = useState<object | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResumeSubmit = async (data: ResumeGenerationData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🚀 Starting resume generation (mock for now)...');
      console.log(`📁 Processing LinkedIn export file: ${data.linkedinExportFile.name} (${(data.linkedinExportFile.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // TODO: Replace with real ResumeGenerator once browser compatibility is fixed
      // Mock generation for now
      const delay = data.useCache ? 3000 : 6000;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const mockJsonResume = createMockJsonResume(data.useCache);
      setGeneratedResume(mockJsonResume);
      
      console.log('✅ Resume generation successful (mock)!');
      
    } catch (err) {
      console.error('❌ Resume generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to generate resume: ${errorMessage}`);
      setGeneratedResume(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    generatedResume,
    isGenerating,
    error,
    handleResumeSubmit,
    clearError
  };
};
