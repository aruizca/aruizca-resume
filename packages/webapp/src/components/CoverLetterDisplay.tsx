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
import { useState } from 'react'

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
  wordCount = 300 
}: CoverLetterDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const toast = useToast()

  // Convert markdown to clean HTML for professional display
  const renderMarkdownAsHtml = (markdown: string) => {
    if (!markdown) return ''
    
    return markdown
      // Remove markdown code block syntax
      .replace(/```[a-z]*\n?/g, '')
      .replace(/```/g, '')
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic  
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert double line breaks to paragraphs
      .replace(/\n\n/g, '</p><p>')
      // Convert single line breaks to spaces (for professional formatting)
      .replace(/\n/g, ' ')
      // Wrap in paragraph tags
      .replace(/^(.*)$/, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
  }



  const downloadPdf = async () => {
    setIsDownloading(true)
    
    try {
      // Create a simple HTML document for PDF generation
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cover Letter</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px; 
            }
            h1, h2, h3 { color: #333; }
            p { margin-bottom: 1rem; text-align: justify; }
          </style>
        </head>
        <body>
          ${renderMarkdownAsHtml(coverLetter)}
        </body>
        </html>
      `
      
      // Create a blob and trigger download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const filename = `cover-letter-${new Date().toISOString().split('T')[0]}.html`
      
      const linkElement = document.createElement('a')
      linkElement.href = url
      linkElement.download = filename
      linkElement.click()
      
      window.URL.revokeObjectURL(url)
      
      toast({
        title: 'Download started',
        description: `Cover letter downloaded as ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download cover letter. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDownloading(false)
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
                  __html: renderMarkdownAsHtml(coverLetter)
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
