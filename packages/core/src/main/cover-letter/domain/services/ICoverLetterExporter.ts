import { CoverLetter } from '../model/CoverLetter';

/**
 * Interface for HTML export functionality
 */
export interface ICoverLetterHtmlExporter {
  export(coverLetter: CoverLetter): Promise<string>;
}

/**
 * Interface for PDF export functionality
 */
export interface ICoverLetterPdfExporter {
  export(coverLetter: CoverLetter, options?: import('../../../shared/infrastructure/pdf').PdfOptions): Promise<Buffer>;
}
