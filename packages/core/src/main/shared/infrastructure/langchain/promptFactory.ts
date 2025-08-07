import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface PromptConfig {
  templatePath?: string;
  template?: string;
  inputVariables?: string[];
}

export class PromptFactory {
  /**
   * Creates a PromptTemplate from a file path
   */
  static async createFromFile(templatePath: string): Promise<PromptTemplate> {
    const template = await readFile(templatePath, 'utf8');
    return PromptTemplate.fromTemplate(template);
  }

  /**
   * Creates a PromptTemplate from a template string
   */
  static createFromTemplate(template: string): PromptTemplate {
    return PromptTemplate.fromTemplate(template);
  }

  /**
   * Creates a ChatPromptTemplate from messages
   */
  static createChatPrompt(messages: Array<[string, string]>): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages(messages);
  }

  /**
   * Creates a resume generation prompt template
   */
  static async createResumePrompt(): Promise<PromptTemplate> {
    const promptPath = join(process.cwd(), 'src', 'main', 'resume-generator', 'prompts', 'resumePrompt.txt');
    return this.createFromFile(promptPath);
  }

  /**
   * Creates a cover letter generation prompt template
   */
  static async createCoverLetterPrompt(): Promise<PromptTemplate> {
    const promptPath = join(process.cwd(), 'src', 'main', 'cover-letter-generator', 'prompts', 'coverLetterPrompt.txt');
    return this.createFromFile(promptPath);
  }
} 