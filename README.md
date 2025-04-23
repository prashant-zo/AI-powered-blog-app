# ✨ BLOG-AI

**BLOG-AI** is a modern, full-featured blogging platform backend powered by **Cloudflare Workers**, **Hono**, and **Prisma Accelerate**. It includes user authentication, blog CRUD, comments, likes/bookmarks, AI-powered suggestions, and scalable deployment via Cloudflare Pages.

> Built for performance, scalability, and developer experience — optimized for the edge.  
> **Frontend**: Coming soon (React).

---

## 🏗️ Tech Stack

- **Cloudflare Workers** — Edge-native compute
- **Hono** — Lightning-fast TypeScript web framework
- **Prisma Accelerate** — Serverless database access via PostgreSQL
- **Zod** — Type-safe request validation
- **JWT** — Secure auth (token-based)
- **Web Crypto API** — Password hashing (bcrypted alternative)
- **Vitest + Miniflare** — Testing Workers apps locally

---

## 📁 Directory Structure


---

## 🚀 API Endpoints

| Feature         | Method | Endpoint                                  | Description                            |
|----------------|--------|-------------------------------------------|----------------------------------------|
| **Auth**        | POST   | `/api/v1/auth/signup`                     | Register user                          |
|                 | POST   | `/api/v1/auth/signin`                     | Login user                             |
|                 | GET    | `/api/v1/auth/logout`                     | Logout user                            |
| **User**        | GET    | `/api/v1/user/:id`                        | Get user profile                       |
|                 | PUT    | `/api/v1/user/:id`                        | Update bio or avatar                   |
| **Blog**        | POST   | `/api/v1/blog`                            | Create blog                            |
|                 | GET    | `/api/v1/blog`                            | List blogs (paginated feed)            |
|                 | GET    | `/api/v1/blog/:id`                        | Get blog detail                        |
|                 | PUT    | `/api/v1/blog/:id`                        | Update blog                            |
|                 | DELETE | `/api/v1/blog/:id`                        | Delete blog                            |
| **Like/Bookmark**| POST  | `/api/v1/blog/:id/like`                   | Like a blog                            |
|                 | POST   | `/api/v1/blog/:id/bookmark`              | Bookmark blog                          |
| **Comment**     | POST   | `/api/v1/blog/:id/comment`                | Add comment                            |
|                 | DELETE | `/api/v1/blog/:id/comment/:cid`          | Delete comment                         |
| **AI**          | POST   | `/api/v1/ai/autocomplete`                | Suggest blog title/content (AI)        |
|                 | GET    | `/api/v1/ai/suggest`                     | Recommend blogs                        |
| **Explore**     | GET    | `/api/v1/blog/trending`                  | Trending blogs                         |
| **Search**      | GET    | `/api/v1/blog/search?q=keyword`          | Search blogs by title/tags             |

---

## 🧠 Features

- ✅ JWT Auth with middleware
- ✅ Prisma + Accelerate for efficient DB queries
- ✅ Input validation using **Zod**
- ✅ Structured & scalable folder setup
- ✅ Worker-ready: deploy to **Cloudflare Workers/Pages**
- ✅ AI endpoints (OpenAI / Workers AI ready)
- ✅ Testing with Vitest + Miniflare

---

## ⚙️ Setup & Local Dev

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Setup DB schema
npx prisma generate
npx prisma migrate dev

# 4. Start dev server
npx wrangler dev
