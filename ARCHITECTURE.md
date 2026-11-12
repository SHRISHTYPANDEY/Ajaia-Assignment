
# Architecture

## Application Overview

The application is built using Next.js 16 App Router.
The same Next.js project handles both the frontend UI and backend API routes.

## Technology Choices

- Next.js and React handle the application UI.
- TypeScript provides type safety.
- TipTap provides rich-text editing functionality.
- Supabase PostgreSQL stores users, documents and sharing information.
- Mammoth converts DOCX files into HTML.
- Marked converts Markdown into HTML.
- Vitest is used for automated unit testing.

## Data Storage

Documents are stored in the Supabase PostgreSQL database.
Document content is stored as HTML to preserve rich-text formatting.

## Access Control

The resolveAccess function contains pure document permission logic.
It checks whether a user is the owner, a shared user or has no access.

The loadDocWithAccess helper is used by document API routes to check access.

Only document owners can share or revoke access.
Shared users can edit documents.

## Authentication

Authentication is mocked using cookie-based user identification.
This approach was selected to keep the assignment focused on core functionality within the available development time.

## Priorities

The primary priority was completing the core document management and sharing workflow end to end.

## Out of Scope

- Real-time collaboration
- Comments
- Version history
- Advanced user roles

## Future Improvements

With another 2-4 hours of development, the following could be added:

- Row Level Security (RLS)
- View-only and edit permissions
- Markdown export
- Real authentication
