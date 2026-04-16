# Blog App

A full-stack blogging platform built with Next.js App Router, NextAuth (Google), MongoDB (Mongoose), and Tailwind CSS.

## Features

- Google sign-in with NextAuth
- Create, list, and delete blog posts
- Author profile pages and author-specific post feeds
- Comment system for blog posts
- Light and dark theme support
- Toast notifications with Sonner

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- NextAuth v4
- MongoDB + Mongoose
- Tailwind CSS

## Prerequisites

- Node.js 18.18+ (Node.js 20+ recommended)
- MongoDB database (local or Atlas)
- Google OAuth credentials for NextAuth

## Environment Variables

Create a .env.local file in the project root with:

```env
MONGODB_URI=your_mongodb_connection_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_secret
```

Notes:

- NEXTAUTH_URL should match your app URL in each environment.
- NEXTAUTH_SECRET should be a long random string in production.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open http://localhost:3000

## Available Scripts

- npm run dev: Start local development server
- npm run build: Build for production
- npm run start: Run production build
- npm run lint: Run ESLint checks

## App Routes

- /: Landing page
- /blogapp: Main blog feed and editor access
- /profile: Logged-in user profile
- /profile/[email]: Public profile by email

## API Routes

### Auth

- GET/POST /api/auth/[...nextauth]

### Blogs

- GET /api/blogs: Get all posts
- POST /api/blogs: Create a post (authenticated)
- DELETE /api/blogs/[id]: Delete a post by id
- GET /api/blogs/author/[email]: Get posts by author email

### Comments

- GET /api/comments?blogId=...: Get comments for a blog
- POST /api/comments: Create comment (authenticated)

### Users

- GET /api/users/[email]: Get basic user profile

### Health Check

- GET /api/test-db: Verify MongoDB connection status

## Project Structure

- app: App Router pages and API routes
- components: UI and page-level React components
- lib: Shared utilities (MongoDB connector, helpers)
- models: Mongoose models
- public: Static assets

## Deployment

Deploy to any platform that supports Next.js (for example Vercel).

For production deployment:

- Set all required environment variables
- Ensure MongoDB network access is allowed from deployment environment
- Configure Google OAuth redirect URIs for your production domain
