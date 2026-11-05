# CARROM-X v2 — by Nikhil Chary Sriramoju
Frontend: index.html, style.css, app.js (physics, agentic planner, RAG, CNN-style map, PWA).
Backend: api/coach.js (rate-limited Groq proxy), api/health.js (Vercel serverless).
Set env var GROQ_API_KEY in Vercel for the server-side coach (optional; the game works without it).
Docker: `docker compose up --build` -> http://localhost:8080 (static; /api needs Vercel).
