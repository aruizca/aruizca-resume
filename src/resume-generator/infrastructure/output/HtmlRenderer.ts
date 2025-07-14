import { Resume } from '../../domain/model/Resume';
import * as theme from 'jsonresume-theme-even';

export class HtmlRenderer {
  async render(resume: Resume): Promise<string> {
    // Use the jsonresume-theme-even package to render HTML
    return theme.render(resume as any);
  }
} 