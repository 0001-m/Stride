# Stride (MERN Project Management)

Modern team project management app built with **MongoDB + Express + React + Node** and **Tailwind CSS**.

## Tech
- **Backend**: Express, Mongoose, JWT auth
- **Frontend**: React (Vite), React Router, Axios, Tailwind

## Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` → `server/.env` and set:
- **`MONGODB_URI`**: Mongo connection string
- **`JWT_SECRET`**: long random string (keep secret)
- **`JWT_EXPIRES_IN`**: e.g. `7d`
- **`PORT`**: default `5000`
- **`CLIENT_URL`** (dev / separate-frontend deployments): e.g. `http://localhost:5173`

### Frontend (`client/.env`)
Copy `client/.env.example` → `client/.env` and set:
- **`VITE_API_URL`**
  - Dev: `http://localhost:5000/api`
  - Single-service prod (Express serves React): `/api`

## Local Development (2 terminals)

### Terminal 1 (API)
```bash
cd server
npm install
npm run dev
```

### Terminal 2 (Web)
```bash
cd client
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
API health check: `http://localhost:5000/api/health`

## Production Build (single-service deploy)

This repo supports deploying as **one Node service**:
1) Build the React app
2) Start the Express server
3) Express serves `client/dist` and your API under `/api`

### Steps
```bash
cd client
npm install
npm run build

cd ../server
npm install
NODE_ENV=production npm start
```

Then open: `http://localhost:5000`

## Deployment Checklist
- **Secrets**: never commit `.env` files
- **JWT**: set a strong `JWT_SECRET`
- **MongoDB**: use a hosted MongoDB (Atlas) connection string for production
- **CORS**:
  - Single-service deployment: no CORS needed (same origin)
  - Separate frontend: set `CLIENT_URL` to your frontend’s deployed URL
- **Client API URL**:
  - Single-service: set `VITE_API_URL=/api` before building
  - Separate services: set `VITE_API_URL=https://your-api-domain/api`

