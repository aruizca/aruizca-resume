import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

export interface ChainConfig {
  model: ChatOpenAI;
  prompt: PromptTemplate;
  outputParser?: 'json' | 'string';
}

export class ChainFactory {
  /**
   * Creates a basic chain with prompt, model, and output parser
   */
  static createChain(config: ChainConfig): RunnableSequence {
    const { model, prompt, outputParser = 'json' } = config;
    
    const parser = outputParser === 'json' 
      ? new JsonOutputParser() 
      : new StringOutputParser();
    
    return prompt.pipe(model).pipe(parser);
  }

  /**
   * Creates a resume generation chain
   */
  static async createResumeChain(model: ChatOpenAI): Promise<RunnableSequence> {
    const { PromptFactory } = await import('./promptFactory');
    const prompt = await PromptFactory.createResumePrompt();
    
    return this.createChain({
      model,
      prompt,
      outputParser: 'json'
    });
  }

  /**
   * Creates a cover letter generation chain
   */
  static async createCoverLetterChain(model: ChatOpenAI): Promise<RunnableSequence> {
    const { PromptFactory } = await import('./promptFactory');
    const prompt = await PromptFactory.createCoverLetterPrompt();
    
    return this.createChain({
      model,
      prompt,
      outputParser: 'string'
    });
  }
} 