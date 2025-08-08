import {
  Alert,
  AlertIcon,
  Box,
  CloseButton,
  Heading,
  SimpleGrid,
  Text
} from '@chakra-ui/react';
import { useResumeGeneration } from '../hooks/useResumeGeneration';
import { ResumeGenerationForm } from '../components/ResumeGenerationForm';
import { ResumeDisplay } from '../components/ResumeDisplay';

/**
 * Resume generation page component
 */
export const ResumePage = () => {
  const { generatedResume, isGenerating, error, handleResumeSubmit, clearError } = useResumeGeneration();

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
        
        {/* Error Alert */}
        {error && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontSize="sm">{error}</Text>
            </Box>
            <CloseButton
              alignSelf="flex-start"
              position="relative"
              right={-1}
              top={-1}
              onClick={clearError}
            />
          </Alert>
        )}
        
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
