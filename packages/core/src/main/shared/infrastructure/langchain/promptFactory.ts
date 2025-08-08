import { PromptTemplate, ChatPromptTemplate } from '@langchain/core/prompts';
import { resumePrompt } from '../../../resume/prompts';
import { coverLetterJsonPrompt } from '../../../cover-letter/prompts';

export interface PromptConfig {
  templatePath?: string;
  template?: string;
  inputVariables?: string[];
}

export class PromptFactory {
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
    return this.createFromTemplate(resumePrompt);
  }

  /**
   * Creates a cover letter generation prompt template
   */
  static async createCoverLetterPrompt(): Promise<PromptTemplate> {
    return this.createFromTemplate(coverLetterJsonPrompt);
  }
} 