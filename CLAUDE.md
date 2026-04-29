# LeadForge Development Guide

## Commands
- **Backend**: `cd server && npm run dev`
- **Frontend**: `cd client && npm run dev`
- **Database**: `npx prisma studio` (after migration)

## Tech Stack
- **Frontend**: React, Tailwind CSS 4, Framer Motion, Lucide React
- **Backend**: Node.js, Express, Prisma
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API
- **Email**: Resend API

## Coding Patterns
- Use functional components and hooks in React.
- Use async/await for all asynchronous operations.
- Implement robust error handling and logging.
- Follow the directory structure:
  - `client/src/components`: UI components
  - `client/src/pages`: Page components
  - `server/src/controllers`: Request handlers
  - `server/src/services`: Business logic
  - `server/src/routes`: API routes
