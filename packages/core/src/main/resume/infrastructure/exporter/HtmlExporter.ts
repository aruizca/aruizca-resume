import { Resume } from '../../domain';
import { render } from 'jsonresume-theme-even';

/**
 * HTML exporter that exports JSON Resume to HTML format using jsonresume-theme-even
 * Restored to use the original working theme template
 */
export class ResumeHtmlExporter {
  /**
   * Filter out Twitter and Stack Overflow profiles from resume for HTML export
   * @param resume The resume to filter
   * @returns Filtered resume copy
   */
  private filterProfilesForHtml(resume: Resume): Resume {
    if (!resume || !resume.basics) {
      throw new Error('Invalid resume data: resume or resume.basics is null/undefined');
    }

    if (!resume.basics.profiles) {
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
   * Export a JSON resume to HTML using jsonresume-theme-even
   * @param resume The JSON resume to export
   * @returns HTML string
   */
  async export(resume: Resume): Promise<string> {
    try {
      // Validate resume data
      if (!resume || !resume.basics) {
        throw new Error('Invalid resume data: resume or resume.basics is null/undefined');
      }

      // Filter out Twitter and Stack Overflow profiles for HTML export
      const filteredResume = this.filterProfilesForHtml(resume);
      
      // Use jsonresume-theme-even to render the resume
      const html = render(filteredResume as any);
      
      return html;
    } catch (error) {
      console.error('Error in HTML export:', error);
      throw error;
    }
  }
}
