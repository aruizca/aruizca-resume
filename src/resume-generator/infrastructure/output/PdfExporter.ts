import { writeFile } from 'fs/promises';

export class PdfExporter {
  async export(html: string, pdfPath: string): Promise<void> {
    // TODO: Use puppeteer/playwright/pdf-lib to render PDF from HTML
    await writeFile(pdfPath, Buffer.from('PDF placeholder'));
  }
} 