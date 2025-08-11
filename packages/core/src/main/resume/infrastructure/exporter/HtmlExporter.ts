import { Resume } from '../../domain';
import { IResumeHtmlExporter } from '../../domain/services/IJsonResumeExporter';

/**
 * HTML exporter that exports JSON Resume to HTML format
 * Includes custom CSS for better layout and full-width first section
 * Generates clean HTML without external theme dependencies
 */
export class ResumeHtmlExporter implements IResumeHtmlExporter {
  /**
   * Filter out Twitter and Stack Overflow profiles from resume for HTML export
   * @param resume The resume to filter
   * @returns Filtered resume copy
   */
  private filterProfilesForHtml(resume: Resume): Resume {
    if (!resume.basics?.profiles) {
      return resume;
    }

    const filteredResume = { ...resume };
    filteredResume.basics = { ...resume.basics };
    filteredResume.basics.profiles = resume.basics.profiles.filter((profile: any) => {
      const network = profile.network?.toLowerCase();
      return network !== 'twitter' && network !== 'stack overflow';
    });

    return filteredResume;
  }

  /**
   * Get custom CSS for better layout and full-width first section
   * @returns Custom CSS string
   */
  private getCustomCSS(): string {
    return `
      <style>
        /* Custom CSS for better resume layout - Restored from previous improvements */
        
        /* Reset and base styles */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Lato', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 96.5%;
          margin: 0 auto;
          padding: 2em;
          background: white;
        }
        
        /* Header section spans full width */
        .masthead, .profile, .basics {
          width: 100%;
          max-width: 100%;
          background: #f3f4f5;
          padding: 2em;
          text-align: center;
          margin-bottom: 2em;
          border-radius: 8px;
        }
        
        /* Optimize font sizes for PDF */
        h1 {
          font-size: 2.5em;
          margin: 0.5em 0;
          color: #191e23;
        }
        
        h2 {
          font-size: 2em;
          margin: 0.4em 0;
          color: #6c7781;
        }
        
        h3 {
          font-size: 1.5em;
          color: #6c7781;
          margin-bottom: 1rem;
          border-bottom: 2px solid #0073aa;
          padding-bottom: 0.5em;
        }
        
        /* Two-column layout */
        .resume-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2em;
        }
        
        .left-column {
          grid-column: 1;
        }
        
        .right-column {
          grid-column: 2;
        }
        
        /* Profile section spans both columns */
        .profile, .basics {
          grid-column: 1 / -1;
          width: 100%;
          max-width: 100%;
        }
        
        /* Contact information styling */
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1em;
          margin: 1em 0;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5em;
          color: #6c7781;
        }
        
        /* Work experience styling */
        .work-item {
          margin-bottom: 1.5em;
          padding-bottom: 1em;
          border-bottom: 1px solid #eee;
        }
        
        .work-item:last-child {
          border-bottom: none;
        }
        
        .work-title {
          font-weight: bold;
          color: #191e23;
        }
        
        .work-company {
          color: #0073aa;
          font-weight: 500;
        }
        
        .work-duration {
          color: #6c7781;
          font-size: 0.9em;
        }
        
        .work-description {
          margin-top: 0.5em;
          color: #333;
        }
        
        /* Skills styling */
        .skills-list {
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5em;
        }
        
        .skill-item {
          background: #f3f4f5;
          padding: 0.3em 0.8em;
          border-radius: 20px;
          font-size: 0.9em;
          color: #333;
        }
        
        /* Print-specific optimizations */
        @media print {
          body {
            margin: 0;
            padding: 0.5in;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
      </style>
    `;
  }

  /**
   * Generate HTML for resume sections
   * @param resume The resume data
   * @returns HTML string for resume sections
   */
  private generateResumeSections(resume: Resume): string {
    let sectionsHtml = '';
    
    // Work experience
    if (resume.work && resume.work.length > 0) {
      sectionsHtml += `
        <div class="left-column">
          <h3>Work Experience</h3>
          ${resume.work.map(work => `
            <div class="work-item">
              <div class="work-title">${work.position || 'Position'}</div>
              <div class="work-company">${work.name || 'Company'}</div>
              <div class="work-duration">${work.startDate || ''} - ${work.endDate || 'Present'}</div>
              ${work.summary ? `<div class="work-description">${work.summary}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Skills
    if (resume.skills && resume.skills.length > 0) {
      sectionsHtml += `
        <div class="right-column">
          <h3>Skills</h3>
          ${resume.skills.map(skill => `
            <div class="skill-item">${skill.name || skill}</div>
          `).join('')}
        </div>
      `;
    }
    
    return sectionsHtml;
  }

  /**
   * Export a JSON resume to HTML
   * @param resume The JSON resume to export
   * @returns HTML string
   */
  async export(resume: Resume): Promise<string> {
    try {
      // Filter out Twitter and Stack Overflow profiles for HTML export
      const filteredResume = this.filterProfilesForHtml(resume);
      
      // Generate contact information
      const contactInfo = filteredResume.basics ? `
        <div class="contact-info">
          ${filteredResume.basics.email ? `<div class="contact-item">📧 ${filteredResume.basics.email}</div>` : ''}
          ${filteredResume.basics.phone ? `<div class="contact-item">📞 ${filteredResume.basics.phone}</div>` : ''}
          ${filteredResume.basics.location ? `<div class="contact-item">📍 ${filteredResume.basics.location.city || ''}, ${filteredResume.basics.location.countryCode || ''}</div>` : ''}
          ${filteredResume.basics.profiles ? filteredResume.basics.profiles.map(profile => `
            <div class="contact-item">🔗 ${profile.network || ''}: ${profile.url || profile.username || ''}</div>
          `).join('') : ''}
        </div>
      ` : '';
      
      // Generate the complete HTML
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${filteredResume.basics?.name || 'Resume'}</title>
          ${this.getCustomCSS()}
        </head>
        <body>
          <div class="masthead">
            <h1>${filteredResume.basics?.name || 'Your Name'}</h1>
            <p>${filteredResume.basics?.label || 'Professional Title'}</p>
            ${filteredResume.basics?.summary ? `<p>${filteredResume.basics.summary}</p>` : ''}
            ${contactInfo}
          </div>
          
          <div class="resume-content">
            ${this.generateResumeSections(filteredResume)}
          </div>
        </body>
        </html>
      `;
      
      return html;
    } catch (error) {
      console.error('Error in HTML export:', error);
      throw error;
    }
  }
}
