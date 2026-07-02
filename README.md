# NextReads

A full-stack book discovery and social reading platform. Search and browse books via the OpenLibrary API, get AI-powered recommendations from a Groq (LLaMA 3.1) chatbot, track your reading in a personal library, follow a community activity feed, and catch up on a live literary news feed aggregated from multiple RSS sources.

- **Live site:** https://next-read-phi.vercel.app
- **API (backend):** https://nextread-6l8e.onrender.com
- **Repository:** https://github.com/RafeUmair/nextRead

### Try it out

A test account is available so you can explore without signing up:
- **Email:** "Test@gmail.com"
- **Password:** "123456"

## Features

- **Book discovery** — search and browse books sourced from the OpenLibrary API, with genre-filtered popular picks
- **AI reading assistant** — a Groq (LLaMA 3.1) powered chatbot that recommends books based on your existing list and genre preferences
- **"Find my next read"** — in Discovery, hand-pick a few books you like and Groq AI generates tailored recommendations based on your picks
- **Personal library** — save, track, and manage books in "My Books," backed by Firestore
- **Community activity feed** — see what other users are reading and adding
- **Literary news feed** — live RSS aggregation from NPR Books, Book Riot, Lit Hub, and The Marginalian, with source filtering and pagination
- **Auth & roles** — Firebase Authentication with role-based access control for admin privileges
- **Responsive UI** — built with React and Tailwind CSS

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Vite, Tailwind CSS |
| Backend | Java 17, Spring Boot 3 (REST API) |
| AI | Groq API (LLaMA 3.1) |
| Auth & data | Firebase Authentication, Firestore |
| Book data | OpenLibrary API |
| News | Multi-source RSS aggregation |
| Infra | Docker, deployed on Vercel (frontend) and Render (backend) |
