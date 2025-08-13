import { ResumeHtmlExporter } from '../../../resume/infrastructure/exporter/HtmlExporter';
import { ResumePdfExporter } from '../../../resume/infrastructure/exporter/PdfExporter';
import { CoverLetterHtmlExporter } from '../../../cover-letter/infrastructure/exporter/HtmlExporter';
import { CoverLetterPdfExporter } from '../../../cover-letter/infrastructure/exporter/PdfExporter';

/**
 * Factory for creating exporters with proper dependency injection
 * Ensures shared instances and consistent configuration across the application
 */
export class ExporterFactory {
  private static instance: ExporterFactory;
  private resumeHtmlExporter: ResumeHtmlExporter;
  private resumePdfExporter: ResumePdfExporter;
  private coverLetterHtmlExporter: CoverLetterHtmlExporter;
  private coverLetterPdfExporter: CoverLetterPdfExporter;

  private constructor() {
    this.resumeHtmlExporter = new ResumeHtmlExporter();
    this.resumePdfExporter = new ResumePdfExporter();
    this.coverLetterHtmlExporter = new CoverLetterHtmlExporter();
    this.coverLetterPdfExporter = new CoverLetterPdfExporter(this.coverLetterHtmlExporter);
  }

  /**
   * Get singleton instance of the factory
   */
  static getInstance(): ExporterFactory {
    if (!ExporterFactory.instance) {
      ExporterFactory.instance = new ExporterFactory();
    }
    return ExporterFactory.instance;
  }

  /**
   * Get resume HTML exporter
   */
  getResumeHtmlExporter(): ResumeHtmlExporter {
    return this.resumeHtmlExporter;
  }

  /**
   * Get resume PDF exporter
   */
  getResumePdfExporter(): ResumePdfExporter {
    return this.resumePdfExporter;
  }

  /**
   * Get cover letter HTML exporter
   */
  getCoverLetterHtmlExporter(): CoverLetterHtmlExporter {
    return this.coverLetterHtmlExporter;
  }

  /**
   * Get cover letter PDF exporter
   */
  getCoverLetterPdfExporter(): CoverLetterPdfExporter {
    return this.coverLetterPdfExporter;
  }



  /**
   * Reset factory instance (useful for testing)
   */
  static reset(): void {
    ExporterFactory.instance = undefined as any;
  }
}
