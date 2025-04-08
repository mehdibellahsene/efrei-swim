# EFREI Swim Club Platform

A comprehensive platform for managing the EFREI Swimming Club, built with Next.js and Supabase.

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</div>

<div align="center">
  <p><strong>Application de gestion pour le club de natation EFREI</strong></p>
</div>

## Features

- User authentication and role-based access
- Event calendar with different types of events
- Entry card management system
- Budget tracking
- Forum/article system
- Responsive UI built with Shadcn UI components

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (Authentication, Database, Storage)
- **State Management**: React Context API
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account

### Setting Up Supabase

1. Create a new Supabase project
2. In the SQL Editor, run the SQL script from `lib/supabase-schema.sql` to create all the necessary tables and security policies
3. Copy your Supabase URL and anon key from the API section

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/votre-username/efrei-swim.git
   cd efrei-swim
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Tables

- **profiles**: User profiles with roles
- **events**: Calendar events (trainings, competitions, outings)
- **cards**: Entry cards for the swimming pool
- **purchases**: Budget transactions
- **articles**: Forum posts/articles
- **comments**: Comments on articles

### Row Level Security

The database uses Row Level Security (RLS) to ensure users can only access and modify data according to their roles:

- **Admin**: Full access to all data
- **Membre**: Can create events, manage budget, write articles
- **Athlete**: Can view events, articles, and limited budget info
- **Visiteur**: Limited access to public content

## Architecture

The application follows a clean architecture with clear separation of concerns:

- **UI Components**: Presentational components in `/components`
- **Data Access Layer**: API functions in `/lib/supabase-api.ts`
- **Authentication**: Centralized auth provider in `/components/supabase-auth-provider.tsx`
- **Role Management**: Role-based access control in `/components/role-provider.tsx`

## License

This project is licensed under the MIT License.

<div align="center">
  <p>Développé avec ❤️ pour le club de natation EFREI</p>
</div>
