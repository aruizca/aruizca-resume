import { Resume } from '../model/Resume';

/**
 * Interface for HTML export functionality
 */
export interface IResumeHtmlExporter {
  export(resume: Resume): Promise<string>;
}

/**
 * Interface for PDF export functionality
 */
export interface IResumePdfExporter {
  export(resume: Resume, options?: import('../../../shared/infrastructure/pdf').PdfOptions): Promise<Buffer>;
}
