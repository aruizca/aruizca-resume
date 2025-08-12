import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Code,
  HStack,
  IconButton,
  Spinner,
  TabList,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { FaFilePdf, FaFileAlt } from 'react-icons/fa'
import React, { useState, useEffect } from 'react'
import { config } from '../config'

interface CoverLetterCodeBlockProps {
  content: string
  maxHeight?: string
}

function CoverLetterCodeBlock({ content, maxHeight = "600px" }: CoverLetterCodeBlockProps) {
  const toast = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: 'Copied to clipboard',
        description: 'The cover letter markdown has been copied to your clipboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      position="relative"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      bg="gray.900"
      minH="400px"
      maxH={maxHeight}
      overflowY="auto"
    >
      <IconButton
        aria-label="Copy cover letter to clipboard"
        icon={<CopyIcon />}
        size="sm"
        position="absolute"
        top={2}
        right={2}
        zIndex={1}
        colorScheme="blue"
        variant="solid"
        onClick={copyToClipboard}
      />
      <Code
        display="block"
        whiteSpace="pre-wrap"
        fontSize="sm"
        color="white"
        bg="transparent"
        p={4}
        pr={12} // Extra padding on right to avoid overlap with copy button
      >
        {content}
      </Code>
    </Box>
  )
}

interface CoverLetterDisplayProps {
  coverLetter: string
  isGenerating: boolean
  wordCount?: number
}

export function CoverLetterDisplay({ 
  coverLetter, 
  isGenerating, 
  wordCount = 250 
}: CoverLetterDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState('')
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const toast = useToast()

  // Fetch formatted HTML from the API for preview
  const fetchFormattedHtml = async (coverLetterText: string) => {
    if (!coverLetterText) return ''
    
    setIsLoadingPreview(true)
    try {
      console.log('📡 Fetching formatted HTML for:', coverLetterText.substring(0, 100) + '...');
      console.log('🌐 API URL:', `${config.apiBaseUrl}/api/cover-letter/export/html`);
      const response = await fetch(`${config.apiBaseUrl}/api/cover-letter/export/html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverLetter: {
            jobOffer: {
              title: "Software Engineer",
              company: "Company",
              url: "https://example.com",
              description: "",
              requirements: [],
              location: "Location"
            },
            userProfile: {
              profile: [],
              positions: [],
              education: [],
              skills: []
            },
            content: coverLetterText,
            generatedAt: new Date().toISOString(),
            metadata: { 
              wordCount,
              tone: "professional",
              focusAreas: []
            }
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      return html;
    } catch (error) {
      console.error('Failed to fetch formatted HTML:', error);
      toast({
        title: 'Preview generation failed',
        description: 'Failed to generate formatted preview. Showing raw markdown.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return '';
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Update rendered HTML when cover letter changes
  useEffect(() => {
    if (coverLetter) {
      console.log('🔄 Cover letter changed, fetching formatted HTML...');
      fetchFormattedHtml(coverLetter).then(html => {
        console.log('✅ HTML fetched successfully, length:', html.length);
        setRenderedHtml(html);
      }).catch(error => {
        console.error('❌ Error setting rendered HTML:', error);
      });
    }
  }, [coverLetter]); // Remove wordCount dependency





  const downloadPdf = async () => {
    setIsDownloading(true)
    
    try {
      console.log('📄 Generating PDF from preview content...');
      
      // First generate HTML from the markdown content
      const htmlResponse = await fetch(`${config.apiBaseUrl}/api/cover-letter/export/html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coverLetter: {
            jobOffer: {
              title: "Software Engineer",
              company: "Company",
              url: "https://example.com",
              description: "",
              requirements: [],
              location: "Location"
            },
            userProfile: {
              profile: [],
              positions: [],
              education: [],
              skills: []
            },
            content: coverLetter,
            generatedAt: new Date().toISOString(),
            metadata: { 
              wordCount,
              tone: "professional",
              focusAreas: []
            }
          }
        }),
      });

      if (!htmlResponse.ok) {
        const errorData = await htmlResponse.json();
        throw new Error(errorData.error || `HTML generation failed: ${htmlResponse.status}`);
      }

      const html = await htmlResponse.text();

      // Then convert the HTML to PDF
      const response = await fetch(`${config.apiBaseUrl}/api/cover-letter/export/html-to-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: html
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const filename = `cover-letter-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = filename;
      linkElement.click();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF downloaded successfully',
        description: `Cover letter saved as ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('PDF download failed:', error);
      toast({
        title: 'PDF generation failed',
        description: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  }

  const actualWordCount = coverLetter 
    ? coverLetter.split(/\s+/).filter(word => word.length > 0).length 
    : 0

  if (isGenerating) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text color="gray.600">Generating your cover letter...</Text>
        <Text fontSize="sm" color="gray.500">
          This may take a few moments while we analyze the job posting and your resume.
        </Text>
      </VStack>
    )
  }

  if (!coverLetter) {
    return (
      <Box py={8}>
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Ready to generate your cover letter</Text>
            <Text fontSize="sm">
              Fill in the form on the left and click "Generate Cover Letter" to get started.
            </Text>
          </VStack>
        </Alert>
      </Box>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Action Buttons and Word Count */}
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} justify="space-between">
          <HStack spacing={3} flexWrap="wrap">
            <Button
              onClick={downloadPdf}
              colorScheme="red"
              size="sm"
              isLoading={isDownloading}
              loadingText="Generating..."
              leftIcon={<FaFilePdf />}
            >
              Download PDF
            </Button>
          </HStack>
          
          {/* Word Count Badge */}
          <Badge colorScheme="blue" variant="subtle" fontSize="sm" px={3} py={1}>
            📝 {actualWordCount} words
          </Badge>
        </HStack>
      </VStack>

      {/* Cover Letter Content */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>👁️ Preview</Tab>
          <Tab>📝 Markdown Source</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              p={6}
              bg="white"
              minH="400px"
              maxH="800px"
              overflowY="auto"
              fontSize="md"
              lineHeight="1.6"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              <Box
                dangerouslySetInnerHTML={{
                  __html: renderedHtml || coverLetter
                }}
                sx={{
                  '& h1': {
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: 'gray.800',
                  },
                  '& h2': {
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem',
                    color: 'gray.700',
                  },
                  '& h3': {
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    marginTop: '1rem',
                    color: 'gray.600',
                  },
                  '& strong': {
                    fontWeight: 'bold',
                    color: 'gray.800',
                  },
                  '& em': {
                    fontStyle: 'italic',
                  },
                  '& p': {
                    marginBottom: '1rem',
                    textAlign: 'justify',
                    fontSize: 'md',
                    lineHeight: '1.6',
                    color: 'gray.800',
                  },
                  '& a': {
                    color: 'blue.500',
                    textDecoration: 'underline',
                  },
                  '& a:hover': {
                    color: 'blue.700',
                  },
                }}
              />
            </Box>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} justify="space-between">
                <Text fontWeight="bold" fontSize="md">Cover Letter Markdown</Text>
                <HStack spacing={2}>
                  <Badge colorScheme="green">✓ Generated</Badge>
                </HStack>
              </HStack>
              
              <CoverLetterCodeBlock content={coverLetter} />
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}
