# MERN Setup

This repository is configured with separate folders:

- `frontend` → React + Vite + Tailwind CSS
- `server` → Node.js + Express

## Install dependencies

From project root:

```bash
npm run install:all
```

Or separately:

```bash
npm run install:frontend
npm run install:server
```

## Run in development

Start frontend:

```bash
npm run dev:frontend
```

Start server:

```bash
npm run dev:server
```

- Frontend runs on `http://localhost:5173`
- Server runs on `http://localhost:5000`
- Health route: `GET /api/health`
