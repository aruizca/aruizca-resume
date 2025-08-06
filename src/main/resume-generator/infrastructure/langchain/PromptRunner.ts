import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { OpenAICache } from '../cache/OpenAICache';

export class PromptRunner {
  private openai: OpenAI;
  private model: string = 'gpt-4o';
  private promptPath = join(process.cwd(), 'src', 'main', 'resume-generator', 'prompts', 'resumePrompt.txt');
  private cache: OpenAICache;

  constructor(forceRefresh: boolean = false) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
    this.cache = new OpenAICache({ forceRefresh });
  }

  async run(parsedData: any, forceRefresh: boolean = false): Promise<any> {
    // Load prompt template from file
    let promptTemplate = await readFile(this.promptPath, 'utf8');
    
    // Check cache first
    const cachedResponse = await this.cache.get(parsedData, promptTemplate, forceRefresh);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Interpolate LinkedIn data
    const prompt = promptTemplate.replace('{{linkedinData}}', JSON.stringify(parsedData, null, 2));
    
    console.log('🤖 Calling OpenAI API...');
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates JSON Resume data.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_completion_tokens: 4096
    });
    
    let content = response.choices[0]?.message?.content || '';
    // Remove Markdown code block if present
    content = content.replace(/```json|```/g, '').trim();
    
    try {
      const result = JSON.parse(content);
      
      // Cache the response
      await this.cache.set(parsedData, promptTemplate, result);
      
      return result;
    } catch (e) {
      throw new Error('Failed to parse LLM response as JSON: ' + content);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    return await this.cache.getStats();
  }

  /**
   * Clear the cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
} 