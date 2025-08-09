import { LangchainPromptRunner, ModelFactory, PromptFactory } from '../../../shared';
import { Resume } from '../../domain';

export class PromptRunner extends LangchainPromptRunner<any, Resume> {
  constructor(forceRefresh: boolean = false) {
    super({
      modelFactory: () => ModelFactory.createResumeModel(),
      promptFactory: () => PromptFactory.createResumePrompt(),
      inputTransformer: (parsedData) => ({
        linkedinData: JSON.stringify(parsedData, null, 2)
      }),
      outputTransformer: (result) => result as Resume,
      outputParser: 'json',
      cacheConfig: {
        ttl: 8 * 60 * 60 * 1000 // 8 hours
      },
      operationName: 'Generate JSON Resume (LLM)'
    });
  }

  async run(parsedData: any, forceRefresh: boolean = false): Promise<Resume> {
    return await this.execute(parsedData, forceRefresh);
  }

  /**
   * Run with email-based cache key for user-specific caching
   * @param parsedData LinkedIn parsed data
   * @param userEmail Email address to use for cache key
   * @param forceRefresh Whether to bypass cache
   */
  async runWithEmailCache(parsedData: any, userEmail: string, forceRefresh: boolean = false): Promise<Resume> {
    // Create a modified input that includes the email for cache key generation
    const inputWithEmail = {
      ...parsedData,
      __cache_email: userEmail // Special field for cache key
    };
    
    console.log(`📧 Using email-based cache for: ${userEmail}`);
    return await this.execute(inputWithEmail, forceRefresh);
  }

  // getCacheStats() and clearCache() methods are inherited from LangchainPromptRunner
} 