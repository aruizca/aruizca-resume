# LinkedIn to JSON Resume Converter

A TypeScript tool to convert LinkedIn data exports into the JSON Resume format.

## Features

- Converts LinkedIn data exports (CSV files) to JSON Resume format
- Handles multiple sections: work experience, education, skills, languages, projects, and certifications
- Includes training courses in the meta section
- Uses the latest LinkedIn export file automatically

## Setup

1. Clone the repository:
```bash
git clone https://github.com/aruizca/aruizca-resume.git
cd aruizca-resume
```

2. Install dependencies:
```bash
npm install
```

3. Place your LinkedIn export file in the `linkedin-export` directory

## Usage

1. Export your data from LinkedIn:
   - Go to LinkedIn Settings & Privacy
   - Under "Data privacy", click "Get a copy of your data"
   - Select "Basic profile data" and any other data you want to include
   - Download the ZIP file when ready

2. Place the downloaded ZIP file in the `linkedin-export` directory

3. Build the project:
```bash
npm run build
```

4. Run the conversion:
```bash
npm run convert
```

The script will:
- Find the most recent LinkedIn export file
- Convert the data to JSON Resume format
- Save the result as `resume.json`

## Project Structure

- `src/convert.ts` - Main conversion script
- `linkedin-export/` - Directory for LinkedIn export files
- `public/` - Directory for published files
- `resume.json` - Generated JSON Resume file

## Dependencies

- TypeScript
- csv-parse
- yauzl
- esbuild

## License

MIT 

# Resume AI Builder (CLI)

A local-first, CLI-based resume generator that takes a LinkedIn export ZIP, extracts relevant data, and produces:
- `resume.json` (JSON Resume format)
- `resume.html` (rendered with jsonresume-theme-even)
- `resume.pdf` (PDF export)

## Usage

```sh
npm run build
npm start [path/to/linkedin-export/extracted]
```
- If no path is provided, defaults to `linkedin-export/extracted`.
- Outputs are written to the `output/` directory.

## Architecture

- **src/app/GenerateResume.ts**: Orchestrates the pipeline
- **src/domain/model/Resume.ts**: Resume entity (JSON Resume schema)
- **src/domain/services/ResumeBuilder.ts**: Resume construction logic
- **src/infrastructure/parsers/LinkedInParser.ts**: LinkedIn CSV/HTML extraction
- **src/infrastructure/langchain/PromptRunner.ts**: LLM prompt runner (LangChain/OpenAI)
- **src/adapters/output/HtmlRenderer.ts**: HTML rendering (jsonresume-theme-even)
- **src/adapters/output/PdfExporter.ts**: HTML-to-PDF export
- **src/main.ts**: CLI entrypoint

## Roadmap
- Integrate LangChain.js + OpenAI for structured resume generation
- Improve theme rendering and PDF export
- Add UI and cover letter support (future)

--- 