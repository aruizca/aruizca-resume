import { createReadStream } from 'fs';
import { writeFile, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import yauzl from 'yauzl';
import { promisify } from 'util';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

interface Profile {
  Name: string;
  Headline: string;
  Summary: string;
  Email: string;
  Phone: string;
  Website: string;
  LinkedIn: string;
  Address: string;
  City: string;
  State: string;
  Country: string;
  ZipCode: string;
}

interface Position {
  CompanyName: string;
  Title: string;
  Description: string;
  StartedOn: string;
  FinishedOn: string;
}

interface Education {
  SchoolName: string;
  FieldOfStudy: string;
  Degree: string;
  StartedOn: string;
  FinishedOn: string;
}

interface Skill {
  Name: string;
}

interface Language {
  Name: string;
}

interface Project {
  Name: string;
  Description: string;
  StartedOn: string;
  FinishedOn: string;
  Url: string;
}

interface Certification {
  Name: string;
  Url: string;
  Authority: string;
  StartedOn: string;
  FinishedOn: string;
  LicenseNumber: string;
}

interface Course {
  Name: string;
  Number: string;
}

interface LinkedInData {
  Profile?: Profile;
  Positions?: Position[];
  Education?: Education[];
  Skills?: Skill[];
  Languages?: Language[];
  Projects?: Project[];
  Certifications?: Certification[];
  Courses?: Course[];
}

interface PositionRecord {
  'Company Name': string;
  Title: string;
  Description: string;
  'Started On': string;
  'Finished On': string;
}

interface EducationRecord {
  'School Name': string;
  'Field of Study': string;
  'Degree Name': string;
  'Start Date': string;
  'End Date': string;
}

interface SkillRecord {
  Name: string;
}

interface LanguageRecord {
  Language: string;
}

interface ProjectRecord {
  'Project Name': string;
  Description: string;
  'Started On': string;
  'Finished On': string;
  Url: string;
}

interface CertificationRecord {
  Name: string;
  Url: string;
  Authority: string;
  'Started On': string;
  'Finished On': string;
  'License Number': string;
}

interface CourseRecord {
  Name: string;
  Number: string;
}

interface JsonResume {
  basics: {
    name: string;
    label: string;
    email: string;
    phone: string;
    url: string;
    summary: string;
    location: {
      address: string;
      city: string;
      region: string;
      countryCode: string;
      postalCode: string;
    };
    profiles: Array<{
      network: string;
      username: string;
      url: string;
    }>;
  };
  work: Array<{
    company: string;
    position: string;
    website: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    gpa: string;
    courses: string[];
  }>;
  skills: Array<{
    name: string;
    level: string;
    keywords: string[];
  }>;
  languages: Array<{
    language: string;
    fluency: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    highlights: string[];
    keywords: string[];
    startDate: string;
    endDate: string;
    url: string;
    roles: string[];
    entity: string;
    type: string;
  }>;
  certificates: Array<{
    name: string;
    date: string;
    url: string;
    issuer: string;
  }>;
  meta: {
    training: Array<{
      name: string;
      institution: string;
      number: string;
    }>;
  };
}

function convertToJsonResume(data: LinkedInData): JsonResume {
  return {
    basics: {
      name: data.Profile?.Name || '',
      label: data.Profile?.Headline || '',
      email: data.Profile?.Email || '',
      phone: data.Profile?.Phone || '',
      url: data.Profile?.Website || '',
      summary: data.Profile?.Summary || '',
      location: {
        address: data.Profile?.Address || '',
        city: data.Profile?.City || '',
        region: data.Profile?.State || '',
        countryCode: data.Profile?.Country || '',
        postalCode: data.Profile?.ZipCode || ''
      },
      profiles: [{
        network: 'LinkedIn',
        username: data.Profile?.LinkedIn || '',
        url: data.Profile?.LinkedIn || ''
      }]
    },
    work: data.Positions?.map(position => ({
      company: position.CompanyName || '',
      position: position.Title || '',
      website: '',
      startDate: position.StartedOn || '',
      endDate: position.FinishedOn || '',
      summary: position.Description || '',
      highlights: []
    })) || [],
    education: [
      // Formal education
      ...(data.Education?.map(edu => ({
        institution: edu.SchoolName || '',
        area: edu.FieldOfStudy || '',
        studyType: edu.Degree || '',
        startDate: edu.StartedOn || '',
        endDate: edu.FinishedOn || '',
        gpa: '',
        courses: []
      })) || [])
    ],
    skills: data.Skills?.map(skill => ({
      name: skill.Name || '',
      level: '',
      keywords: []
    })) || [],
    languages: data.Languages?.map(lang => ({
      language: lang.Name || '',
      fluency: ''
    })) || [],
    projects: data.Projects?.map(project => ({
      name: project.Name || '',
      description: project.Description || '',
      highlights: [],
      keywords: [],
      startDate: project.StartedOn || '',
      endDate: project.FinishedOn || '',
      url: project.Url || '',
      roles: [],
      entity: '',
      type: ''
    })) || [],
    certificates: data.Certifications?.map(cert => ({
      name: cert.Name || '',
      date: cert.FinishedOn || '',
      url: cert.Url || '',
      issuer: cert.Authority || ''
    })) || [],
    meta: {
      training: data.Courses?.map(course => ({
        name: course.Name.split(' by ')[0]?.trim() || '',
        institution: course.Name.split(' by ')[1]?.split(',')[0]?.trim() || '',
        number: course.Number || ''
      })) || []
    }
  };
}

async function findLatestLinkedInExport(): Promise<string> {
  const exportDir = join(__dirname, '../linkedin-export');
  const files = await readdir(exportDir);
  
  const zipFiles = files.filter(file => 
    file.startsWith('Basic_LinkedInDataExport_') && 
    file.endsWith('.zip')
  );

  if (zipFiles.length === 0) {
    throw new Error('No LinkedIn export files found in linkedin-export directory');
  }

  // Sort files by date in descending order (newest first)
  zipFiles.sort((a, b) => {
    const dateA = a.match(/(\d{2}-\d{2}-\d{4})\.zip$/)?.[1] || '';
    const dateB = b.match(/(\d{2}-\d{2}-\d{4})\.zip$/)?.[1] || '';
    return dateB.localeCompare(dateA);
  });

  return join(exportDir, zipFiles[0]);
}

async function extractLinkedInData(zipPath: string): Promise<LinkedInData> {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return reject(new Error('Failed to open zip file'));

      let data: LinkedInData = {};

      zipfile.on('entry', (entry) => {
        if (entry.fileName.endsWith('.csv')) {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err);
            if (!readStream) return reject(new Error('Failed to open read stream'));

            let csvData = '';
            readStream.on('data', (chunk) => {
              csvData += chunk;
            });

            readStream.on('end', () => {
              try {
                const records = parse(csvData, {
                  columns: true,
                  skip_empty_lines: true,
                  trim: true,
                  relax_column_count: true
                });

                // Process different CSV files based on their names
                if (entry.fileName === 'Profile.csv' && records.length > 0) {
                  const profile = records[0];
                  data.Profile = {
                    Name: `${profile['First Name']} ${profile['Last Name']}`,
                    Headline: profile.Headline,
                    Summary: profile.Summary,
                    Email: profile['Email Address'],
                    Phone: '',
                    Website: profile.Websites?.split(',')[0] || '',
                    LinkedIn: '',
                    Address: '',
                    City: profile['Geo Location']?.split(',')[0] || '',
                    State: profile['Geo Location']?.split(',')[1] || '',
                    Country: profile['Geo Location']?.split(',')[2] || '',
                    ZipCode: ''
                  };
                } else if (entry.fileName === 'Positions.csv') {
                  data.Positions = records.map((record: PositionRecord) => ({
                    CompanyName: record['Company Name'],
                    Title: record.Title,
                    Description: record.Description,
                    StartedOn: record['Started On'],
                    FinishedOn: record['Finished On']
                  }));
                } else if (entry.fileName === 'Education.csv') {
                  data.Education = records.map((record: EducationRecord) => ({
                    SchoolName: record['School Name'],
                    FieldOfStudy: record['Field of Study'],
                    Degree: record['Degree Name'],
                    StartedOn: record['Start Date'],
                    FinishedOn: record['End Date']
                  }));
                } else if (entry.fileName === 'Skills.csv') {
                  data.Skills = records.map((record: SkillRecord) => ({
                    Name: record.Name
                  }));
                } else if (entry.fileName === 'Languages.csv') {
                  data.Languages = records.map((record: LanguageRecord) => ({
                    Name: record.Language
                  }));
                } else if (entry.fileName === 'Projects.csv') {
                  data.Projects = records.map((record: ProjectRecord) => ({
                    Name: record['Project Name'],
                    Description: record.Description,
                    StartedOn: record['Started On'],
                    FinishedOn: record['Finished On'],
                    Url: record.Url
                  }));
                } else if (entry.fileName === 'Certifications.csv') {
                  data.Certifications = records.map((record: CertificationRecord) => ({
                    Name: record.Name,
                    Url: record.Url,
                    Authority: record.Authority,
                    StartedOn: record['Started On'],
                    FinishedOn: record['Finished On'],
                    LicenseNumber: record['License Number']
                  }));
                } else if (entry.fileName === 'Courses.csv') {
                  data.Courses = records.map((record: CourseRecord) => ({
                    Name: record.Name,
                    Number: record.Number
                  }));
                }

                zipfile.readEntry();
              } catch (err) {
                console.error(`Error processing ${entry.fileName}:`, err);
                reject(err);
              }
            });
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on('end', () => {
        resolve(data);
      });

      zipfile.readEntry();
    });
  });
}

async function main() {
  try {
    const zipPath = await findLatestLinkedInExport();
    console.log(`📦 Reading LinkedIn export from: ${zipPath}`);
    
    // Extract date from filename
    const dateMatch = zipPath.match(/(\d{2}-\d{2}-\d{4})\.zip$/);
    if (!dateMatch) {
      throw new Error('Could not extract date from LinkedIn export filename');
    }
    const exportDate = dateMatch[1];
    
    const linkedInData = await extractLinkedInData(zipPath);
    const jsonResume = convertToJsonResume(linkedInData);
    
    // Create resume directory if it doesn't exist
    const resumeDir = join(__dirname, '../resume');
    await mkdir(resumeDir, { recursive: true });
    
    // Write the JSON Resume to a file with the date
    const outputPath = join(resumeDir, `resume-${exportDate}.json`);
    await writeFile(
      outputPath,
      JSON.stringify(jsonResume, null, 2)
    );
    
    console.log('✅ Successfully converted LinkedIn data to JSON Resume format');
    console.log(`📄 Output file: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main(); 