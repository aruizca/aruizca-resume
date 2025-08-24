export const resumePrompt = `Convert the following LinkedIn data to a JSON Resume (https://jsonresume.org/schema):

- Extract contact information from the dedicated email and phone data sections. The emails array contains email addresses (use the Primary one), and the phones array contains phone numbers (use Mobile type if available).
- Extract basic profile information from the profile array including name, summary, location, and website/social profiles.
- IMPORTANT: For the "profiles" section, include the LinkedIn profile URL AND other important social profiles like GitHub. Do NOT include the blog URL in basics.url - only include the LinkedIn profile URL in the profiles array. Use the linkedInProfileUrl field that has been extracted from the data. This will be the actual LinkedIn profile URL from the export data, not a constructed one. Also include GitHub and other relevant social profiles from the profile data.
- For the "skills" section, group skills by typology using the "name" field for the group. Create a single "Soft & Management Skills" section that combines both soft skills and management skills, then create a "Technical Skills" section. List the actual skills in the "keywords" array for each group. List soft and management skills first, then technical skills.
- Always include the "languages" section in the output, listing each language and the proficiency level if available.
- For each work entry, synthesize and summarize verbose content. Provide a brief, clear description (2-3 sentences max) and then a few highlights as bullet points. Avoid copying long text verbatim from LinkedIn.
- If a skill or language could fit in more than one category, use your best judgment.

{linkedinData}`;
