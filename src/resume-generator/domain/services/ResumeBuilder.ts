import { Resume } from '../model/Resume.js';

export class ResumeBuilder {
  build(data: any): Resume {
    // In a real implementation, transform LLM output to Resume entity
    return data as Resume;
  }
} 