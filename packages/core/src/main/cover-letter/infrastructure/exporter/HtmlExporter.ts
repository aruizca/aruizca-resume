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
    const { jobOffer, userProfile, content } = coverLetter;
    
    // Return only the essential cover letter content, no headers/footers
    const html = `
    <div class="cover-letter-content">
        ${this.formatContent(content)}
    </div>`;

    return html;
  }

  /**
   * Format the content by converting markdown to HTML
   */
  private formatContent(content: string): string {
    return content
      .split('\n')
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => this.parseMarkdown(paragraph.trim()))
      .join('\n        ');
  }

  /**
   * Parse markdown syntax to HTML
   */
  private parseMarkdown(text: string): string {
    // Remove markdown code blocks
    text = text.replace(/```markdown\n?/g, '');
    text = text.replace(/```\n?/g, '');
    
    // Parse headers
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    
    // Parse bold and italic
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Parse links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Parse line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Wrap in paragraph if it's not already a header
    if (!text.startsWith('<h')) {
      text = `<p>${text}</p>`;
    }
    
    return text;
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
