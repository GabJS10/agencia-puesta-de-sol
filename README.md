# Puesta del Sol Web

Welcome to the **Puesta del Sol Web** project! This repository contains both the frontend application and the backend CMS for the Puesta del Sol website.

## 🏗 Project Structure

The project is divided into two main directories:

- `/frontend` - The user-facing web application built with Next.js.
- `/backend` - The content management system (CMS) and API built with Strapi.

---

## 💻 Frontend

The frontend is a modern web application designed for high performance and excellent user experience.

### Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/)
- **Animations:** [Framer Motion](https://motion.dev/)
- **Language:** TypeScript
- **Package Manager:** pnpm

### Getting Started

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## ⚙️ Backend

The backend serves as a headless CMS, providing the data and content for the frontend application.

### Tech Stack
- **Framework:** [Strapi](https://strapi.io/)
- **Database:** SQLite (Default for development)
- **Language:** TypeScript
- **Package Manager:** pnpm

### Getting Started

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server in watch mode:
   ```bash
   pnpm dev
   ```
   The Strapi admin panel will be available at `http://localhost:1337/admin`.

---

## 🚀 Deployment

- The **Frontend** can be easily deployed on [Vercel](https://vercel.com/) or any Node.js hosting.
- The **Backend** (Strapi) requires a Node.js environment and a persistent database (e.g., PostgreSQL in production).

## 📄 License

This project is private.
