import { ChatOpenAI } from '@langchain/openai';
import { JobOffer, ParsedLinkedInData } from '../../domain/model';
import { ModelFactory, ChainFactory } from '../../../shared/infrastructure/langchain';

export interface CoverLetterPromptRunner {
  run(jobOffer: JobOffer, userProfile: ParsedLinkedInData): Promise<string>;
}

export class DefaultCoverLetterPromptRunner implements CoverLetterPromptRunner {
  private model: ChatOpenAI;

  constructor() {
    this.model = ModelFactory.createCoverLetterModel();
  }

  async run(jobOffer: JobOffer, userProfile: ParsedLinkedInData): Promise<string> {
    try {
      // Create the chain using shared utilities
      const chain = await ChainFactory.createCoverLetterChain(this.model);
      
      // Prepare input variables
      const inputVariables = {
        jobTitle: jobOffer.title,
        company: jobOffer.company,
        jobDescription: jobOffer.description,
        requirements: jobOffer.requirements.join(', '),
        responsibilities: jobOffer.responsibilities.join(', '),
        userExperience: this.formatUserExperience(userProfile),
        userSkills: this.formatUserSkills(userProfile),
        userStrengths: this.extractUserStrengths(userProfile)
      };

      console.log('🤖 Generating cover letter with Langchain...');
      
      // Execute the chain
      const result = await chain.invoke(inputVariables);
      
      return result as string;
    } catch (error) {
      throw new Error(`Failed to generate cover letter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatUserExperience(userProfile: ParsedLinkedInData): string {
    if (!userProfile.positions || userProfile.positions.length === 0) {
      return 'No work experience found';
    }
    
    return userProfile.positions
      .slice(0, 3) // Take last 3 positions
      .map((position: any) => `${position.Title} at ${position.CompanyName} (${position.StartDate} - ${position.EndDate || 'Present'})`)
      .join('; ');
  }

  private formatUserSkills(userProfile: ParsedLinkedInData): string {
    if (!userProfile.skills || userProfile.skills.length === 0) {
      return 'No skills found';
    }
    
    return userProfile.skills
      .slice(0, 10) // Take top 10 skills
      .map((skill: any) => skill.SkillName)
      .join(', ');
  }

  private extractUserStrengths(userProfile: ParsedLinkedInData): string {
    // TODO: Implement more sophisticated strength extraction in Phase 3
    // For now, return a basic summary
    const experienceCount = userProfile.positions?.length || 0;
    const skillsCount = userProfile.skills?.length || 0;
    
    return `Experienced professional with ${experienceCount} positions and ${skillsCount} skills`;
  }
} 