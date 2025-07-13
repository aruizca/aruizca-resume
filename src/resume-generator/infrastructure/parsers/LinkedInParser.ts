import { readFile } from 'fs/promises';
import { join } from 'path';
import Papa from 'papaparse';

export class LinkedInParser {
  async parse(extractedDir: string): Promise<any> {
    // Read relevant CSVs
    const profileCsv = await readFile(join(extractedDir, 'Profile.csv'), 'utf8');
    const positionsCsv = await readFile(join(extractedDir, 'Positions.csv'), 'utf8');
    const educationCsv = await readFile(join(extractedDir, 'Education.csv'), 'utf8');
    const skillsCsv = await readFile(join(extractedDir, 'Skills.csv'), 'utf8');
    // Parse CSVs
    const profile = Papa.parse(profileCsv, { header: true }).data;
    const positions = Papa.parse(positionsCsv, { header: true }).data;
    const education = Papa.parse(educationCsv, { header: true }).data;
    const skills = Papa.parse(skillsCsv, { header: true }).data;
    return { profile, positions, education, skills };
  }
} 