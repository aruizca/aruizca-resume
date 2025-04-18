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

3. Run the conversion:
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