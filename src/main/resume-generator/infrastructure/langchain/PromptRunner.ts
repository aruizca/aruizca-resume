import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import { join } from 'path';

export class PromptRunner {
  private openai: OpenAI;
  private model: string = 'gpt-4o';
  private promptPath = join(process.cwd(), 'src', 'main', 'resume-generator', 'prompts', 'resumePrompt.txt');

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async run(parsedData: any): Promise<any> {
    // Load prompt template from file
    let promptTemplate = await readFile(this.promptPath, 'utf8');
    // Interpolate LinkedIn data
    const prompt = promptTemplate.replace('{{linkedinData}}', JSON.stringify(parsedData, null, 2));
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
      return JSON.parse(content);
    } catch (e) {
      throw new Error('Failed to parse LLM response as JSON: ' + content);
    }
  }
} 