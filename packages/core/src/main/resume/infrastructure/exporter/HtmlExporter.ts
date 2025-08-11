import { Resume } from '../../domain';
import { IResumeHtmlExporter } from '../../domain/services/IJsonResumeExporter';
import * as theme from 'jsonresume-theme-even';

/**
 * HTML exporter that exports JSON Resume to HTML format
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
   * Export a JSON resume to HTML
   * @param resume The JSON resume to export
   * @returns HTML string
   */
  async export(resume: Resume): Promise<string> {
    // Filter out Twitter and Stack Overflow profiles for HTML export
    const filteredResume = this.filterProfilesForHtml(resume);
    
    // Use the jsonresume-theme-even package to render HTML
    return theme.render(filteredResume as any);
  }
}
