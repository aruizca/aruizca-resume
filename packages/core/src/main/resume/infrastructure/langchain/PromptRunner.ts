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

  // getCacheStats() and clearCache() methods are inherited from LangchainPromptRunner
} 