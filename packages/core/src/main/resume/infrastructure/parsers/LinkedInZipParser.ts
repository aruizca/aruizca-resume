import JSZip from 'jszip';
import Papa from 'papaparse';

/**
 * Parser for LinkedIn export ZIP files in memory
 * Handles both Buffer (Node.js) and File (browser) inputs
 */
export class LinkedInZipParser {
  async parse(zipData: Buffer | File | ArrayBuffer): Promise<any> {
    try {
      const zip = new JSZip();
      let zipContents: JSZip;

      // Handle different input types
      if (zipData instanceof Buffer) {
        zipContents = await zip.loadAsync(zipData);
      } else if (zipData instanceof File) {
        const arrayBuffer = await zipData.arrayBuffer();
        zipContents = await zip.loadAsync(arrayBuffer);
      } else if (zipData instanceof ArrayBuffer) {
        zipContents = await zip.loadAsync(zipData);
      } else {
        throw new Error('Unsupported ZIP data type. Expected Buffer, File, or ArrayBuffer.');
      }

      // Extract and read relevant CSV files
      const profileCsv = await this.extractCsvFile(zipContents, 'Profile.csv');
      const positionsCsv = await this.extractCsvFile(zipContents, 'Positions.csv');
      const educationCsv = await this.extractCsvFile(zipContents, 'Education.csv');
      const skillsCsv = await this.extractCsvFile(zipContents, 'Skills.csv');
      
      // Extract contact information
      const primaryEmail = await this.extractPrimaryEmail(zipContents);
      const primaryPhone = await this.extractPrimaryPhone(zipContents);
      const linkedInProfileUrl = await this.extractLinkedInProfileUrl(zipContents);
      const githubUrl = await this.extractGithubUrl(zipContents);

      // Parse CSVs
      const profile = Papa.parse(profileCsv, { header: true }).data;
      const positions = Papa.parse(positionsCsv, { header: true }).data;
      const education = Papa.parse(educationCsv, { header: true }).data;
      const skills = Papa.parse(skillsCsv, { header: true }).data;

      return { profile, positions, education, skills, primaryEmail, primaryPhone, linkedInProfileUrl, githubUrl };
    } catch (error) {
      throw new Error(`Failed to parse LinkedIn export ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractCsvFile(zip: JSZip, filename: string): Promise<string> {
    const file = zip.file(filename);
    if (!file) {
      // Try to find the file in subdirectories
      const foundFile = Object.keys(zip.files).find(path => path.endsWith(filename));
      if (foundFile) {
        const foundFileObj = zip.file(foundFile);
        if (foundFileObj) {
          return await foundFileObj.async('text');
        }
      }
      throw new Error(`File ${filename} not found in LinkedIn export ZIP`);
    }
    return await file.async('text');
  }

  /**
   * Extract primary email from Email Addresses.csv
   * @param zip ZIP contents to search for email data
   * @returns Primary email string or empty string if not found
   */
  private async extractPrimaryEmail(zip: JSZip): Promise<string> {
    try {
      const emailsCsv = await this.extractCsvFile(zip, 'Email Addresses.csv');
      const emails = Papa.parse(emailsCsv, { header: true }).data;
      
      if (emails && emails.length > 0) {
        // Look for primary email first
        const primaryEmail = emails.find((email: any) => email.Primary === 'Yes');
        if (primaryEmail && (primaryEmail as any)['Email Address']) {
          return (primaryEmail as any)['Email Address'];
        }
        
        // Fallback to first available email
        const firstEmail = emails[0] as any;
        if (firstEmail && (firstEmail as any)['Email Address']) {
          return (firstEmail as any)['Email Address'];
        }
      }
      
      return '';
    } catch (error) {
      console.log('Email Addresses.csv not found, primary email will be empty');
      return '';
    }
  }

  /**
   * Extract primary phone number from PhoneNumbers.csv
   * @param zip ZIP contents to search for phone data
   * @returns Primary phone number string or empty string if not found
   */
  private async extractPrimaryPhone(zip: JSZip): Promise<string> {
    try {
      const phonesCsv = await this.extractCsvFile(zip, 'PhoneNumbers.csv');
      const phones = Papa.parse(phonesCsv, { header: true }).data;
      
      if (phones && phones.length > 0) {
        // Look for mobile phone first
        const mobilePhone = phones.find((phone: any) => phone.Type === 'Mobile');
        if (mobilePhone && (mobilePhone as any).Number) {
          return (mobilePhone as any).Number;
        }
        
        // Fallback to first available phone
        const firstPhone = phones[0] as any;
        if (firstPhone && (firstPhone as any).Number) {
          return (firstPhone as any).Number;
        }
      }
      
      return '';
    } catch (error) {
      console.log('PhoneNumbers.csv not found, primary phone will be empty');
      return '';
    }
  }

  /**
   * Extract GitHub URL from profile data
   * @param zip ZIP contents to search for profile data
   * @returns GitHub URL or empty string if not found
   */
  private async extractGithubUrl(zip: JSZip): Promise<string> {
    try {
      const profileCsv = await this.extractCsvFile(zip, 'Profile.csv');
      const profile = Papa.parse(profileCsv, { header: true }).data;
      
      if (profile && profile.length > 0) {
        const profileData = profile[0] as any;
        if (profileData.Websites) {
          // Parse the Websites field which contains "BLOG:url,OTHER:url,OTHER:url"
          const websites = profileData.Websites;
          const githubMatch = websites.match(/OTHER:https:\/\/github\.com\/[^,\]]+/);
          if (githubMatch) {
            return githubMatch[0].replace('OTHER:', '');
          }
        }
      }
      
      return '';
    } catch (error) {
      console.log('Profile.csv not found or GitHub URL not found, GitHub URL will be empty');
      return '';
    }
  }

  /**
   * Extract LinkedIn profile URL from invitations data
   * @param zip ZIP contents to search for invitations
   * @returns LinkedIn profile URL or empty string if not found
   */
  private async extractLinkedInProfileUrl(zip: JSZip): Promise<string> {
    try {
      const invitationsCsv = await this.extractCsvFile(zip, 'Invitations.csv');
      const invitations = Papa.parse(invitationsCsv, { header: true }).data;
      
      if (invitations && invitations.length > 0) {
        const firstInvitation = invitations[0] as any;
        if (firstInvitation.inviterProfileUrl) {
          return firstInvitation.inviterProfileUrl;
        }
      }
      
      return '';
    } catch (error) {
      console.log('Invitations.csv not found, LinkedIn profile URL will be empty');
      return '';
    }
  }
}
