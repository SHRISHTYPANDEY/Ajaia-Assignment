
# Collaborative Docs Editor

A lightweight full-stack collaborative document editor built for the Ajaia AI-Native Full Stack Developer assignment.

## Live Demo

Live URL: PASTE_YOUR_VERCEL_URL_HERE

GitHub Repository: https://github.com/SHRISHTYPANDEY/Ajaia-Assignment

Walkthrough Video: See VIDEO.txt

## Features

- Create, rename, edit, save and reopen documents.
- Rich-text editing with bold, italic, underline and headings.
- Bulleted and numbered lists.
- Automatic saving with a visible save status.
- Upload TXT, MD and DOCX files as new editable documents.
- Share documents with other users by email.
- Revoke document access.
- Separate Owned and Shared with me sections.
- Persistent document storage using Supabase PostgreSQL.
- API validation and error handling.
- Automated tests using Vitest.

## Tech Stack

- Next.js 16 (App Router)
- React
- TypeScript
- TipTap Editor
- Supabase PostgreSQL
- Mammoth
- Marked
- Vitest

## Test Accounts

Authentication is mocked for demonstration. No passwords are required.

| Name | Email |
|---|---|
| Alice | alice@test.com |
| Bob | bob@test.com |
| Carol | carol@test.com |

## Suggested Demo Flow

1. Log in as Alice.
2. Create a document and add formatted content.
3. Share it with bob@test.com.
4. Log out and log in as Bob.
5. Open and edit the shared document.
6. Log in as Carol and verify that direct access returns 403.

## Local Setup

### Prerequisites
- Node.js 20+
- A Supabase project

### Install dependencies

```bash
npm install
```

### Database Setup

Run the SQL schema from your project's database setup in the Supabase SQL Editor.

Ensure the sharing table name matches the API implementation (`shares`).

### Environment Variables

Create a `.env.local` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

Never commit your service role key.

### Run the project

```bash
npm run dev
```

Open http://localhost:3000

### Run Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

## Supported File Uploads

- .txt
- .md
- .docx
- Maximum file size: 2 MB.

Uploaded files are converted into new editable documents. The document title is generated from the original filename.

## Known Limitations

- Authentication is mocked and is not production-ready.
- Images inside DOCX files are not imported.
- Shared users have full editing access.
- No real-time collaboration or presence indicators.
- No version history.
- No view-only or comment-based permissions.
- TypeScript noImplicitAny is relaxed as a time-boxed development decision.

## Project Structure

```text
src/
  app/
    page.tsx
    docs/
      page.tsx
      [id]/
        page.tsx
    api/
      docs/
      logout/
  lib/
    access.ts
    textToHtml.ts
    auth.ts
    db.ts
```

See ARCHITECTURE.md and AI_WORKFLOW.md for more details.
