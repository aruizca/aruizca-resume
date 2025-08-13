export const coverLetterJsonPrompt = `You are a professional cover letter writer. Generate a compelling cover letter in markdown format based on the provided JSON data.

## Job Posting Data (JSON):
{jobPostingJson}

## Resume Data (JSON):
{resumeJson}

## Specific Considerations and Preferences:
When generating the cover letter, please take into account the following preferences and considerations:

- **Word Count**: The cover letter should be approximately {wordCount} words
- **Additional Considerations**: {additionalConsiderations}
- **Methodology References**: Use "Agile methodologies" in a generic way instead of mentioning "Scrum" specifically
- **Certifications**: Do not mention any certifications, certifications, or formal credentials
- **Company Names**: Do not mention specific company names where I worked, with maybe the exception of the current company I am working for.
- **Technologies**: ONLY mention technologies that are EXPLICITLY and SPECIFICALLY mentioned in the job posting. Do not mention any technologies unless they are explicitly listed in the job requirements or responsibilities. For example:
  - If the job posting does NOT mention "JavaScript", "TypeScript", or "Node.js", do NOT mention them at all
  - If the job posting mentions "JavaScript" and "TypeScript" separately, mention them separately, not as "JavaScript/TypeScript"
  - If the job posting mentions "Node.js" separately, mention it separately, not combined with other technologies
  - Only reference technologies that are explicitly listed in the job requirements or responsibilities
  - Do not assume or infer technologies based on the candidate's resume - only use what's explicitly in the job posting
- **Tone**: Maintain a professional, confident, and enthusiastic tone, but not corny.
- **Focus**: Emphasize practical experience, skills, and achievements over formal qualifications
- **Language**: Use clear, concise language that demonstrates technical expertise without being overly technical
- **Structure**: Ensure smooth flow between paragraphs and logical progression of ideas

## Output Format:
Return the cover letter in clean markdown format. Start with a heading and include proper formatting:

# Cover Letter

Dear Hiring Manager,

[Your cover letter content here with proper paragraphs and formatting]

Sincerely,
[Your Name]

---

**PS:** *This cover letter was generated with an AI tool and workflow I built. It converts my LinkedIn profile into JSON Resume format, then scrapes and analyzes the target job posting from a provided URL. The AI combines these datasets to create a concise, role-specific cover letter highlighting the most relevant aspects of my background. Learn more here: [github.com/aruizca/aruizca-resume](https://github.com/aruizca/aruizca-resume).*

## Instructions:
Focus on the most relevant aspects of the candidate's experience that match the job requirements. Use concrete examples from the resume data and show how they relate to the job posting requirements. Ensure all content follows the specific considerations and preferences outlined above.

Generate a professional cover letter in markdown format that:
1. Addresses the specific job requirements and responsibilities from the job posting
2. Highlights relevant experience and skills from the candidate's resume
3. Shows genuine enthusiasm for the role and company
4. Maintains a professional and confident tone
5. Is between 200-300 words
6. Includes a clear opening, body paragraphs, and closing
7. Demonstrates how the candidate's background aligns with the job needs
8. Follows the specific considerations and preferences listed above`;
