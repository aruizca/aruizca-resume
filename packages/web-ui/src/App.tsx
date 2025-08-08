import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CoverLetterForm } from './components/CoverLetterForm'
import { CoverLetterDisplay } from './components/CoverLetterDisplay'
import { ResumeGenerationForm } from './components/ResumeGenerationForm'
import { useState, useEffect } from 'react'

export interface CoverLetterFormData {
  resumeFile: File | null
  jobUrl: string
  wordCount?: number
  additionalConsiderations?: string
  useCache?: boolean
}

// Resume Generation Page Component
function ResumeGenerationPage() {
  const [generatedResume, setGeneratedResume] = useState<object | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleResumeSubmit = async (data: { linkedinExportFile: File; useCache: boolean }) => {
    setIsGenerating(true)
    
    // Mock generation for now (Iteration 1)
    const delay = data.useCache ? 3000 : 6000 // Longer delay when not using cache
    setTimeout(() => {
      const cacheNote = data.useCache ? "" : " (Fresh generation)"
      const mockJsonResume = {
        "$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
        "basics": {
          "name": "John Doe",
          "label": `Software Developer${cacheNote}`,
          "image": "",
          "email": "john@example.com",
          "phone": "+1 (555) 123-4567",
          "url": "https://johndoe.com",
          "summary": `Passionate software developer with expertise in modern web technologies.${data.useCache ? ' (Enhanced with cached AI responses)' : ' (Freshly generated with new AI content)'}`,
          "location": {
            "countryCode": "US",
            "city": "San Francisco"
          },
          "profiles": []
        },
        "work": [
          {
            "name": "Tech Company",
            "position": "Senior Software Developer",
            "startDate": "2020-01-01",
            "endDate": "",
            "summary": "Led development of scalable web applications using React and Node.js.",
            "url": "",
            "location": "San Francisco, CA"
          }
        ],
        "education": [
          {
            "institution": "University of Technology",
            "area": "Computer Science",
            "studyType": "Bachelor of Science",
            "startDate": "2016-09-01",
            "endDate": "2020-05-01",
            "score": "",
            "courses": []
          }
        ],
        "skills": [
          {
            "name": "JavaScript",
            "level": "Expert",
            "keywords": ["React", "Node.js", "TypeScript"]
          },
          {
            "name": "Python",
            "level": "Advanced",
            "keywords": ["Django", "FastAPI", "Data Analysis"]
          }
        ],
        "volunteer": [],
        "awards": [],
        "certificates": [],
        "publications": [],
        "languages": [],
        "interests": [],
        "references": [],
        "projects": [],
        "meta": {
          "canonical": "https://raw.githubusercontent.com/jsonresume/resume-schema/master/resume.json",
          "version": "v1.0.0",
          "lastModified": new Date().toISOString()
        }
      }
      
      setGeneratedResume(mockJsonResume)
      setIsGenerating(false)
    }, delay)
  }

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
        {isGenerating ? (
          <Box p={6} textAlign="center">
            <Text color="gray.600">Processing your LinkedIn data...</Text>
          </Box>
        ) : generatedResume ? (
          <Box>
            <Button mb={4} colorScheme="brand" size="sm">
              📋 Copy JSON
            </Button>
            <Box
              bg="gray.900"
              p={4}
              borderRadius="md"
              maxH="500px"
              overflowY="auto"
            >
              <Text
                as="pre"
                fontSize="xs"
                color="white"
                whiteSpace="pre-wrap"
              >
                {JSON.stringify(generatedResume, null, 2)}
              </Text>
            </Box>
          </Box>
        ) : (
          <Box p={6} bg="gray.50" borderRadius="md" textAlign="center">
            <Text color="gray.600">
              Your generated JSON Resume will appear here
            </Text>
          </Box>
        )}
      </Box>
    </SimpleGrid>
  )
}

// Cover Letter Generation Page Component
function CoverLetterGenerationPage() {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    resumeFile: null,
    jobUrl: '',
    wordCount: 300,
    additionalConsiderations: '',
    useCache: true,
  })
  
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFormSubmit = async (data: CoverLetterFormData) => {
    setIsGenerating(true)
    setFormData(data)
    
    // Mock generation for now (Iteration 1)
    const delay = data.useCache ? 2000 : 4000 // Longer delay when not using cache
    setTimeout(() => {
      const cacheNote = data.useCache ? "" : " (Generated fresh without cache)"
      const mockCoverLetter = `# Cover Letter${cacheNote}

Dear Hiring Manager,

I am writing to express my strong interest in the position you have posted. Based on my experience and qualifications outlined in my resume, I believe I would be an excellent fit for this role.

**Why I'm a Great Fit:**
- Extensive experience in software development
- Strong background in modern web technologies
- Proven track record of delivering high-quality solutions
- Excellent communication and collaboration skills

**Additional Considerations:**
${data.additionalConsiderations || 'None provided'}

**Target Word Count:** ${data.wordCount || 300} words
**Cache Used:** ${data.useCache ? 'Yes (faster processing)' : 'No (fresh content)'}

I am excited about the opportunity to contribute to your team and would welcome the chance to discuss my qualifications further.

Best regards,
[Your Name]`
      
      setGeneratedCoverLetter(mockCoverLetter)
      setIsGenerating(false)
    }, delay)
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
      {/* Left Column - Form */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          Cover Letter Information
        </Heading>
        <CoverLetterForm
          onSubmit={handleFormSubmit}
          isGenerating={isGenerating}
        />
      </Box>

      {/* Right Column - Generated Cover Letter */}
      <Box
        bg="white"
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.200"
      >
        <Heading as="h2" size="lg" mb={6}>
          Generated Cover Letter
        </Heading>
        <CoverLetterDisplay
          coverLetter={generatedCoverLetter}
          isGenerating={isGenerating}
          wordCount={formData.wordCount}
        />
      </Box>
    </SimpleGrid>
  )
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine current tab index based on URL
  const getCurrentTabIndex = () => {
    if (location.pathname === '/cover-letter') return 1
    return 0 // Default to resume tab for '/' and '/resume'
  }

  // Handle tab change and update URL
  const handleTabChange = (index: number) => {
    if (index === 0) {
      navigate('/resume', { replace: true })
    } else if (index === 1) {
      navigate('/cover-letter', { replace: true })
    }
  }

  // Redirect root to /resume
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/resume', { replace: true })
    }
  }, [location.pathname, navigate])

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="gray.200" py={6}>
        <Container maxW="7xl">
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="2xl" mb={2} color="brand.600">
                AI-Powered Career Tools
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Generate professional resumes and cover letters using AI technology
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Main Content with Tabs */}
      <Container maxW="7xl" py={8}>
        <Tabs 
          variant="enclosed" 
          colorScheme="brand"
          index={getCurrentTabIndex()}
          onChange={handleTabChange}
        >
          <TabList mb={8} justifyContent="center">
            <Tab py={4} px={8} fontSize="lg" fontWeight="medium">
              📄 Generate JSON Resume
            </Tab>
            <Tab py={4} px={8} fontSize="lg" fontWeight="medium">
              ✉️ Generate Cover Letter
            </Tab>
          </TabList>

          <TabPanels>
            {/* Resume Generation Tab */}
            <TabPanel p={0}>
              <ResumeGenerationPage />
            </TabPanel>

            {/* Cover Letter Generation Tab */}
            <TabPanel p={0}>
              <CoverLetterGenerationPage />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  )
}

export default App
