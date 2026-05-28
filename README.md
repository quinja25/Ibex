# Ibex

**AI-powered study platform built for IB students.**

Ibex combines a curriculum-scoped AI tutor, collaborative study rooms, community Q&A, and alumni mentorship — purpose-built for the International Baccalaureate.

---

## Features

- **AI tutor** — Answers IB questions grounded in curriculum content and mark scheme conventions, with cited sources. Upload your own notes and it answers directly from them.
- **Study rooms** — Live video sessions with a collaborative whiteboard and shared Pomodoro timer.
- **Community Q&A** — Ask questions, get answers from peers and verified alumni who passed your exact exams.
- **Knowledge base** — Subject wiki and past Q&A, AI-indexed and searchable across all IB subjects.
- **Streaks & XP** — Gamified daily study habit tracking.

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React, React Router v6, Socket.io-client |
| Backend | Node.js, Express, Socket.io, Sequelize ORM |
| Database | MySQL |
| Auth | JWT + Google OAuth |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## Local development

### Prerequisites
- Node.js 18+
- MySQL 8

### Run

```bash
# Backend
cd server && npm install && npm start

# Frontend
cd client && npm install && npm start
```

Frontend: `http://localhost:3002` · Backend: `http://localhost:3001`

---

## License

Private — all rights reserved.
