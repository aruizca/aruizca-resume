import { CoverLetter } from '../../domain';
import { ICoverLetterPdfExporter } from '../../domain/services/ICoverLetterExporter';
import { CoverLetterHtmlExporter } from './HtmlExporter';
import { PlaywrightPdfGenerator } from '../../../shared';

/**
 * PDF exporter that transforms cover letters to PDF format
 * Uses shared PlaywrightPdfGenerator for PDF generation
 */
export class CoverLetterPdfExporter implements ICoverLetterPdfExporter {
  private pdfGenerator: PlaywrightPdfGenerator;

  constructor(
    private htmlExporter = new CoverLetterHtmlExporter(),
    pdfGenerator?: PlaywrightPdfGenerator
  ) {
    this.pdfGenerator = pdfGenerator || new PlaywrightPdfGenerator();
  }

  /**
   * Export a cover letter to PDF buffer
   * @param coverLetter The cover letter to export
   * @param options Optional PDF generation options
   * @returns PDF as Buffer
   */
  async export(coverLetter: CoverLetter, options?: any): Promise<Buffer> {
    // First export to HTML
    const html = await this.htmlExporter.export(coverLetter);
    
    // Wrap the HTML content with PDF-specific styling
    const pdfHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cover Letter</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12pt;
                line-height: 1.15;
                color: #333;
                margin: 0;
                padding: 0;
                background: white;
            }
            
            .cover-letter-content {
                max-width: 21cm;
                margin: 0 auto;
                padding: 2.54cm;
                background: white;
            }
            
            h1 {
                font-size: 16pt;
                font-weight: bold;
                text-align: left;
                margin-bottom: 1em;
                color: #2c3e50;
            }
            
            p {
                margin: 0 0 1em 0;
                text-align: left;
                text-indent: 0;
            }
            
            strong {
                font-weight: bold;
            }
            
            em {
                font-style: italic;
            }
            
            a {
                color: #3498db;
                text-decoration: underline;
            }
            
            hr {
                border: none;
                border-top: 1px solid #ddd;
                margin: 1em 0;
            }
        </style>
    </head>
    <body>
        ${html}
    </body>
    </html>`;
    
    // Use cover letter specific PDF options following A4 standards
    const coverLetterOptions = {
      format: 'A4',
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      },
      printBackground: true,
      ...options // Allow override of defaults
    };
    
    // Then export HTML to PDF buffer using shared utility
    return await this.pdfGenerator.generateFromHtml(pdfHtml, coverLetterOptions, 'cover-letter');
  }
}
