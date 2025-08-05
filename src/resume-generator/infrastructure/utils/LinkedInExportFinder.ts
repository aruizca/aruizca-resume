import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export class LinkedInExportFinder {
  /**
   * Finds the newest LinkedIn export in the linkedin-export folder
   * @param linkedInExportDir Path to the linkedin-export directory
   * @returns Path to the extracted directory of the newest export
   */
  async findNewestExport(linkedInExportDir: string = 'linkedin-export'): Promise<string> {
    try {
      const files = await readdir(linkedInExportDir);
      
      // Filter for LinkedIn export ZIP files
      const exportFiles = files.filter(file => 
        file.startsWith('Basic_LinkedInDataExport_') && file.endsWith('.zip')
      );
      
      if (exportFiles.length === 0) {
        throw new Error(`No LinkedIn export files found in ${linkedInExportDir}`);
      }
      
      // Get file stats to find the newest
      const fileStats = await Promise.all(
        exportFiles.map(async (file) => {
          const filePath = join(linkedInExportDir, file);
          const stats = await stat(filePath);
          return { file, stats, path: filePath };
        })
      );
      
      // Sort by modification time (newest first)
      fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
      
      const newestFile = fileStats[0];
      console.log(`📁 Using newest LinkedIn export: ${newestFile.file}`);
      
      // Return the extracted directory path
      return join(linkedInExportDir, 'extracted');
    } catch (error) {
      throw new Error(`Failed to find LinkedIn export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 