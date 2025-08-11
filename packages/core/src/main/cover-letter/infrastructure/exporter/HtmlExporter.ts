import { CoverLetter } from '../../domain';
import { ICoverLetterHtmlExporter } from '../../domain/services/ICoverLetterExporter';

/**
 * HTML exporter that transforms cover letters to HTML format
 * Generates clean, professional HTML suitable for PDF conversion
 */
export class CoverLetterHtmlExporter implements ICoverLetterHtmlExporter {
  /**
   * Export a cover letter to HTML string
   * @param coverLetter The cover letter to export
   * @returns HTML as string
   */
  async export(coverLetter: CoverLetter): Promise<string> {
    const { jobOffer, userProfile, content, metadata } = coverLetter;
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cover Letter - ${jobOffer.title}</title>
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            background: white;
        }
        
        .header {
            margin-bottom: 2em;
        }
        
        .contact-info {
            margin-bottom: 1.5em;
        }
        
        .contact-info p {
            margin: 0.2em 0;
            font-size: 14px;
        }
        
        .date {
            margin-bottom: 1.5em;
        }
        
        .recipient {
            margin-bottom: 1.5em;
        }
        
        .recipient p {
            margin: 0.2em 0;
            font-size: 14px;
        }
        
        .salutation {
            margin-bottom: 1em;
            font-weight: bold;
        }
        
        .content {
            text-align: justify;
            margin-bottom: 1.5em;
        }
        
        .content p {
            margin-bottom: 1em;
            text-indent: 0;
        }
        
        .closing {
            margin-top: 2em;
        }
        
        .signature {
            margin-top: 1em;
        }
        
        .metadata {
            margin-top: 2em;
            padding-top: 1em;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        
        .metadata p {
            margin: 0.2em 0;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 0.5in;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="contact-info">
            <p><strong>${this.getFullName(userProfile)}</strong></p>
            ${this.getContactInfo(userProfile)}
        </div>
        
        <div class="date">
            <p>${this.formatDate(coverLetter.generatedAt)}</p>
        </div>
        
        <div class="recipient">
            <p><strong>${jobOffer.company}</strong></p>
            <p>${jobOffer.location || 'Location not specified'}</p>
        </div>
    </div>
    
    <div class="salutation">
        <p>Dear Hiring Manager,</p>
    </div>
    
    <div class="content">
        ${this.formatContent(content)}
    </div>
    
    <div class="closing">
        <p>Sincerely,</p>
        <div class="signature">
            <p><strong>${this.getFullName(userProfile)}</strong></p>
        </div>
    </div>
    
    <div class="metadata">
        <p><strong>Generated:</strong> ${this.formatDateTime(coverLetter.generatedAt)}</p>
        <p><strong>Word Count:</strong> ${metadata.wordCount}</p>
        <p><strong>Tone:</strong> ${metadata.tone}</p>
        <p><strong>Focus Areas:</strong> ${metadata.focusAreas.join(', ')}</p>
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Format the content by converting line breaks to paragraphs
   */
  private formatContent(content: string): string {
    return content
      .split('\n')
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => `<p>${paragraph.trim()}</p>`)
      .join('\n        ');
  }

  /**
   * Extract full name from user profile
   */
  private getFullName(userProfile: any): string {
    // Try to get name from profile data
    if (userProfile.profile && userProfile.profile.length > 0) {
      const profile = userProfile.profile[0];
      if (profile.firstName && profile.lastName) {
        return `${profile.firstName} ${profile.lastName}`;
      }
      if (profile.name) {
        return profile.name;
      }
    }
    return 'Your Name';
  }

  /**
   * Format date for display, handling both Date objects and ISO strings
   */
  private formatDate(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Date not available';
    }
  }

  /**
   * Format date and time for display, handling both Date objects and ISO strings
   */
  private formatDateTime(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleString('en-US');
    } catch (error) {
      console.warn('Error formatting date and time:', error);
      return 'Date and time not available';
    }
  }

  /**
   * Extract contact information from user profile
   */
  private getContactInfo(userProfile: any): string {
    const contactInfo: string[] = [];
    
    if (userProfile.profile && userProfile.profile.length > 0) {
      const profile = userProfile.profile[0];
      
      if (profile.email) {
        contactInfo.push(`<p>${profile.email}</p>`);
      }
      
      if (profile.phone) {
        contactInfo.push(`<p>${profile.phone}</p>`);
      }
      
      if (profile.location) {
        contactInfo.push(`<p>${profile.location}</p>`);
      }
    }
    
    // Add LinkedIn profile if available
    if (userProfile.profile && userProfile.profile.length > 0) {
      const profile = userProfile.profile[0];
      if (profile.publicProfileUrl) {
        contactInfo.push(`<p>LinkedIn: ${profile.publicProfileUrl}</p>`);
      }
    }
    
    // If no contact info found, provide placeholders
    if (contactInfo.length === 0) {
      contactInfo.push('<p>your.email@example.com</p>');
      contactInfo.push('<p>Your Phone Number</p>');
      contactInfo.push('<p>Your Location</p>');
    }
    
    return contactInfo.join('');
  }
}
