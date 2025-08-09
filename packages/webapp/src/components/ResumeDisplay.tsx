import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Code,
  HStack,
  Spinner,
  TabList,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
  Tab,
  TabPanel,
  IconButton,
} from '@chakra-ui/react'
import { CopyIcon } from '@chakra-ui/icons'
import { FaFilePdf, FaFileCode, FaFileAlt } from 'react-icons/fa'
import { useState } from 'react'

interface JsonCodeBlockProps {
  data: object
  maxHeight?: string
}

function JsonCodeBlock({ data, maxHeight = "600px" }: JsonCodeBlockProps) {
  const toast = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      toast({
        title: 'Copied to clipboard',
        description: 'The JSON Resume has been copied to your clipboard.',
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
        aria-label="Copy JSON to clipboard"
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
        whiteSpace="pre"
        fontSize="xs"
        color="white"
        bg="transparent"
        p={4}
        pr={12} // Extra padding on right to avoid overlap with copy button
      >
        {JSON.stringify(data, null, 2)}
      </Code>
    </Box>
  )
}

interface ResumeDisplayProps {
  jsonResume: object | null
  isGenerating: boolean
}

export function ResumeDisplay({ jsonResume, isGenerating }: ResumeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isExportingHtml, setIsExportingHtml] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const toast = useToast()

  const copyToClipboard = async () => {
    if (!jsonResume) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonResume, null, 2))
      toast({
        title: 'Copied to clipboard',
        description: 'The JSON Resume has been copied to your clipboard.',
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

  const downloadJson = async () => {
    if (!jsonResume) return
    
    setIsDownloading(true)
    
    try {
      const dataStr = JSON.stringify(jsonResume, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `resume-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast({
        title: 'Download started',
        description: `Your JSON Resume has been downloaded as ${exportFileDefaultName}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download JSON file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const downloadHtml = async () => {
    if (!jsonResume) return
    
    setIsExportingHtml(true)
    
    try {
      const apiUrl = ''; // Use relative URLs for unified server
      const response = await fetch(`${apiUrl}/api/resume/export/html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: jsonResume }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `resume-${new Date().toISOString().split('T')[0]}.html`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = filename;
      linkElement.click();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'HTML download started',
        description: `Your resume has been downloaded as ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      toast({
        title: 'HTML export failed',
        description: 'Failed to export HTML file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsExportingHtml(false)
    }
  }

  const downloadPdf = async () => {
    if (!jsonResume) return
    
    setIsExportingPdf(true)
    
    try {
      const apiUrl = ''; // Use relative URLs for unified server
      const response = await fetch(`${apiUrl}/api/resume/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: jsonResume }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `resume-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const linkElement = document.createElement('a');
      linkElement.href = url;
      linkElement.download = filename;
      linkElement.click();
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF download started',
        description: `Your resume has been downloaded as ${filename}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
    } catch (error) {
      toast({
        title: 'PDF export failed',
        description: 'Failed to export PDF file. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsExportingPdf(false)
    }
  }

  const validateJsonResume = (resume: any) => {
    const warnings: string[] = []
    const errors: string[] = []

    // Check for basics section (recommended)
    if (!resume.basics) {
      warnings.push('Missing basics section (recommended)')
    } else {
      // Check for recommended basics fields
      if (!resume.basics.name) warnings.push('Missing basics.name (recommended)')
      if (!resume.basics.email) warnings.push('Missing basics.email (recommended)')
    }

    // Check optional but recommended fields
    if (!resume.work || resume.work.length === 0) {
      warnings.push('No work experience provided')
    }
    if (!resume.education || resume.education.length === 0) {
      warnings.push('No education provided')
    }
    if (!resume.skills || resume.skills.length === 0) {
      warnings.push('No skills provided')
    }

    return { errors, warnings }
  }

  const formatJsonForDisplay = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    } catch {
      return dateStr
    }
  }

  /**
   * Filter out Twitter and Stack Overflow profiles for preview (to match HTML/PDF exports)
   */
  const filterProfilesForPreview = (profiles: any[]) => {
    if (!profiles) return profiles;
    return profiles.filter((profile: any) => {
      const network = profile.network?.toLowerCase();
      return network !== 'twitter' && network !== 'stack overflow';
    });
  };

  const renderResumePreview = (resume: any) => {
    return (
      <VStack spacing={8} align="stretch">
        {/* Header/Masthead */}
        {resume.basics && (
          <Box bg="gray.50" p={6} borderRadius="lg" mb={4}>
            <Text fontSize="3xl" fontWeight="bold" mb={2}>
              {resume.basics.name || 'Name not provided'}
            </Text>
            <Text fontSize="xl" color="gray.600" mb={4}>
              {resume.basics.label || 'Professional Title'}
            </Text>
            {resume.basics.summary && (
              <Text fontSize="md" color="gray.700" mb={4}>
                {resume.basics.summary}
              </Text>
            )}
            
            {/* Contact Information */}
            <VStack spacing={2} align="start" mb={3}>
              {resume.basics.location && (
                <Text fontSize="sm" color="gray.600">
                  📍 {resume.basics.location.city}, {resume.basics.location.countryCode}
                </Text>
              )}
              {resume.basics.email && (
                <Text fontSize="sm" color="blue.600" as="a" href={`mailto:${resume.basics.email}`}>
                  ✉️ {resume.basics.email}
                </Text>
              )}
              {resume.basics.phone && (
                <Text fontSize="sm" color="blue.600" as="a" href={`tel:${resume.basics.phone}`}>
                  📞 {resume.basics.phone}
                </Text>
              )}
            </VStack>

            {/* Social Profiles - Filtered to match HTML/PDF exports */}
            {resume.basics.profiles && filterProfilesForPreview(resume.basics.profiles).length > 0 && (
              <VStack spacing={1} align="start">
                {filterProfilesForPreview(resume.basics.profiles).map((profile: any, index: number) => (
                  <Text 
                    key={index} 
                    fontSize="sm" 
                    color="blue.600" 
                    as="a" 
                    href={profile.url} 
                    target="_blank"
                  >
                    {profile.network === 'GitHub' && '🐙'} 
                    {profile.network === 'LinkedIn' && '💼'} 
                    {profile.network === 'Blog' && '📝'} 
                    {!['GitHub', 'LinkedIn', 'Blog'].includes(profile.network) && '🔗'} 
                    {' '}{profile.username || profile.url} ({profile.network})
                  </Text>
                ))}
              </VStack>
            )}
          </Box>
        )}

        {/* Work Experience */}
        {resume.work && resume.work.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Work Experience
            </Text>
            <VStack spacing={6} align="stretch">
              {resume.work.map((job: any, index: number) => (
                <Box key={index} borderLeft="4px solid" borderColor="blue.500" pl={4}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {job.company}
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="blue.600" mb={1}>
                    {job.position}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {formatDate(job.startDate)} – {job.endDate ? formatDate(job.endDate) : 'Present'}
                    {job.location && ` • ${job.location}`}
                  </Text>
                  {job.summary && (
                    <Text fontSize="sm" color="gray.700" mb={2}>
                      {job.summary}
                    </Text>
                  )}
                  {job.highlights && job.highlights.length > 0 && (
                    <Box pl={4}>
                      {job.highlights.map((highlight: string, hIndex: number) => (
                        <Text key={hIndex} fontSize="sm" color="gray.700" mb={1}>
                          • {highlight}
                        </Text>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Education
            </Text>
            <VStack spacing={4} align="stretch">
              {resume.education.map((edu: any, index: number) => (
                <Box key={index} borderLeft="4px solid" borderColor="green.500" pl={4}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {edu.institution}
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="green.600" mb={1}>
                    {edu.studyType} {edu.area && `in ${edu.area}`}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </Text>
                  {edu.gpa && (
                    <Text fontSize="sm" color="gray.700" mt={1}>
                      GPA: {edu.gpa}
                    </Text>
                  )}
                  {edu.courses && edu.courses.length > 0 && (
                    <Box mt={2}>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">Relevant Coursework:</Text>
                      <Text fontSize="sm" color="gray.600">
                        {edu.courses.join(', ')}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Skills
            </Text>
            <VStack spacing={4} align="stretch">
              {resume.skills.map((skillGroup: any, index: number) => (
                <Box key={index}>
                  <Text fontSize="lg" fontWeight="medium" color="gray.800" mb={2}>
                    {skillGroup.name}
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {skillGroup.keywords && skillGroup.keywords.map((keyword: string, kIndex: number) => (
                      <Badge 
                        key={kIndex} 
                        colorScheme="blue" 
                        variant="subtle" 
                        fontSize="xs"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </HStack>
                  {skillGroup.level && (
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Level: {skillGroup.level}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Languages */}
        {resume.languages && resume.languages.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Languages
            </Text>
            <HStack spacing={6} flexWrap="wrap">
              {resume.languages.map((lang: any, index: number) => (
                <Box key={index} textAlign="center">
                  <Text fontSize="md" fontWeight="medium" color="gray.800">
                    {lang.language}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {lang.fluency}
                  </Text>
                </Box>
              ))}
            </HStack>
          </Box>
        )}

        {/* Awards */}
        {resume.awards && resume.awards.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Awards
            </Text>
            <VStack spacing={3} align="stretch">
              {resume.awards.map((award: any, index: number) => (
                <Box key={index} borderLeft="4px solid" borderColor="yellow.500" pl={4}>
                  <Text fontSize="md" fontWeight="medium" color="gray.800">
                    {award.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {award.awarder} • {formatDate(award.date)}
                  </Text>
                  {award.summary && (
                    <Text fontSize="sm" color="gray.700" mt={1}>
                      {award.summary}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Publications */}
        {resume.publications && resume.publications.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Publications
            </Text>
            <VStack spacing={3} align="stretch">
              {resume.publications.map((pub: any, index: number) => (
                <Box key={index} borderLeft="4px solid" borderColor="purple.500" pl={4}>
                  <Text fontSize="md" fontWeight="medium" color="gray.800">
                    {pub.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {pub.publisher} • {formatDate(pub.releaseDate)}
                  </Text>
                  {pub.summary && (
                    <Text fontSize="sm" color="gray.700" mt={1}>
                      {pub.summary}
                    </Text>
                  )}
                  {pub.website && (
                    <Text fontSize="sm" color="blue.600" as="a" href={pub.website} target="_blank" mt={1}>
                      🔗 View Publication
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={4} color="gray.700">
              Projects
            </Text>
            <VStack spacing={4} align="stretch">
              {resume.projects.map((project: any, index: number) => (
                <Box key={index} borderLeft="4px solid" borderColor="orange.500" pl={4}>
                  <Text fontSize="md" fontWeight="medium" color="gray.800">
                    {project.name}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    {formatDate(project.startDate)} – {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                  </Text>
                  {project.description && (
                    <Text fontSize="sm" color="gray.700" mb={2}>
                      {project.description}
                    </Text>
                  )}
                  {project.highlights && project.highlights.length > 0 && (
                    <Box pl={4}>
                      {project.highlights.map((highlight: string, hIndex: number) => (
                        <Text key={hIndex} fontSize="sm" color="gray.700" mb={1}>
                          • {highlight}
                        </Text>
                      ))}
                    </Box>
                  )}
                  {project.url && (
                    <Text fontSize="sm" color="blue.600" as="a" href={project.url} target="_blank" mt={1}>
                      🔗 View Project
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    )
  }

  if (isGenerating) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="xl" color="brand.500" />
        <Text color="gray.600">Generating your JSON Resume...</Text>
        <Text fontSize="sm" color="gray.500">
          Processing LinkedIn data and combining with your input...
        </Text>
      </VStack>
    )
  }

  if (!jsonResume) {
    return (
      <Box py={8}>
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Ready to generate your JSON Resume</Text>
            <Text fontSize="sm">
              Fill in the form on the left and click "Generate JSON Resume" to get started.
            </Text>
          </VStack>
        </Alert>
      </Box>
    )
  }

  const validation = validateJsonResume(jsonResume)

  return (
    <VStack spacing={6} align="stretch">
      {/* Action Buttons and Validation Status */}
      <VStack spacing={4} align="stretch">
        <HStack spacing={4} justify="space-between">
          <HStack spacing={3} flexWrap="wrap">
            <Button
              onClick={downloadJson}
              colorScheme="brand"
              size="sm"
              isLoading={isDownloading}
              loadingText="Downloading..."
              leftIcon={<FaFileAlt />}
            >
              Download JSON
            </Button>
            <Button
              onClick={downloadHtml}
              colorScheme="blue"
              size="sm"
              isLoading={isExportingHtml}
              loadingText="Exporting..."
              leftIcon={<FaFileCode />}
            >
              Download HTML
            </Button>
            <Button
              onClick={downloadPdf}
              colorScheme="red"
              size="sm"
              isLoading={isExportingPdf}
              loadingText="Exporting..."
              leftIcon={<FaFilePdf />}
            >
              Download PDF
            </Button>
          </HStack>
          
        </HStack>
      </VStack>

      {/* Resume Content */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>🔧 JSON Source</Tab>
          <Tab>👁️ Preview</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {/* Validation Status in JSON Tab */}
              <HStack spacing={4} justify="space-between">
                <Text fontWeight="bold" fontSize="md">JSON Resume Data</Text>
                <HStack spacing={2}>
                  {validation.errors.length === 0 ? (
                    <Badge colorScheme="green">✓ Valid JSON Resume</Badge>
                  ) : (
                    <Badge colorScheme="red">⚠ Has Errors</Badge>
                  )}
                  {validation.warnings.length > 0 && (
                    <Badge colorScheme="yellow">⚠ {validation.warnings.length} Warning(s)</Badge>
                  )}
                </HStack>
              </HStack>

              {/* Validation Messages */}
              {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                <VStack spacing={2} align="stretch">
                  {validation.errors.map((error, index) => (
                    <Alert key={`error-${index}`} status="error" size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">{error}</Text>
                    </Alert>
                  ))}
                  {validation.warnings.map((warning, index) => (
                    <Alert key={`warning-${index}`} status="warning" size="sm">
                      <AlertIcon />
                      <Text fontSize="sm">{warning}</Text>
                    </Alert>
                  ))}
                </VStack>
              )}

              <JsonCodeBlock data={jsonResume} />
            </VStack>
          </TabPanel>
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
            >
              {renderResumePreview(jsonResume)}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Schema Information */}
      <Box fontSize="sm" color="gray.600" p={4} bg="gray.50" borderRadius="md">
        <Text fontWeight="medium" mb={2}>📄 JSON Resume Schema</Text>
        <Text>
          This resume follows the{' '}
          <Text as="a" href="https://jsonresume.org/schema/" target="_blank" color="brand.500">
            JSON Resume standard
          </Text>
          {' '}which is supported by many resume builders and ATS systems.
        </Text>
      </Box>
    </VStack>
  )
}
