import { ChatOpenAI } from '@langchain/openai';

export interface ModelConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  openAIApiKey?: string;
}

export class ModelFactory {
  /**
   * Creates a ChatOpenAI model with consistent configuration
   */
  static createModel(config: ModelConfig = {}): ChatOpenAI {
    const apiKey = config.openAIApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: config.modelName || 'gpt-4o',
      temperature: config.temperature || 0.2,
      maxTokens: config.maxTokens || 4096
    });
  }

  /**
   * Creates a model optimized for resume generation
   */
  static createResumeModel(): ChatOpenAI {
    return this.createModel({
      modelName: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 4096
    });
  }

  /**
   * Creates a model optimized for cover letter generation
   */
  static createCoverLetterModel(): ChatOpenAI {
    return this.createModel({
      modelName: 'gpt-4o',
      temperature: 0.2,
      maxTokens: 4096
    });
  }
} 