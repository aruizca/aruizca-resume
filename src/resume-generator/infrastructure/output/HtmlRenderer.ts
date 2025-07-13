import { Resume } from '../../domain/model/Resume.js';

export class HtmlRenderer {
  async render(resume: Resume): Promise<string> {
    // TODO: Use jsonresume-theme-even-crewshin to render real HTML
    return `<html><body><pre>${JSON.stringify(resume, null, 2)}</pre></body></html>`;
  }
} 