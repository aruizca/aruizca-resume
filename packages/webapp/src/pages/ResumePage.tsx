import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  useToast
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useResumeGeneration } from '../hooks/useResumeGeneration';
import { ResumeGenerationForm } from '../components/ResumeGenerationForm';
import { ResumeDisplay } from '../components/ResumeDisplay';

/**
 * Resume generation page component
 */
export const ResumePage = () => {
  const { generatedResume, isGenerating, error, handleResumeSubmit, clearError } = useResumeGeneration();
  const toast = useToast();

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: 'Resume Generation Failed',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      clearError(); // Clear after showing toast
    }
  }, [error, toast, clearError]);

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      {/* Left Column - Resume Form */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          LinkedIn Data Upload
        </Heading>
        

        
        <ResumeGenerationForm
          onSubmit={handleResumeSubmit}
          isGenerating={isGenerating}
        />
      </Box>

      {/* Right Column - Generated Resume */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          Generated JSON Resume
        </Heading>
        <ResumeDisplay 
          jsonResume={generatedResume} 
          isGenerating={isGenerating} 
        />
      </Box>
    </SimpleGrid>
  );
};
