import { useState } from 'react';

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
      console.log('🚀 Starting resume generation via API...');
      console.log(`📁 Processing LinkedIn export file: ${data.linkedinExportFile.name} (${(data.linkedinExportFile.size / 1024 / 1024).toFixed(2)} MB)`);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('linkedinExport', data.linkedinExportFile);
      formData.append('forceRefresh', (!data.useCache).toString()); // forceRefresh is opposite of useCache
      
      // Call the API (same origin when served together, or custom URL in development)
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/resume/generate`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.resume) {
        console.log('✅ Resume generation successful!');
        setGeneratedResume(result.resume);
        
        if (result.performance) {
          console.log('📊 Performance metrics:', {
            parseTime: `${result.performance.parseTime}ms`,
            llmTime: `${result.performance.llmTime}ms`,
            validationTime: `${result.performance.validationTime}ms`,
            totalTime: `${result.performance.totalTime}ms`
          });
        }
      } else {
        throw new Error(result.error || 'Resume generation failed');
      }
      
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
