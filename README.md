# CARROM-X v3 — by Nikhil Chary Sriramoju
Physics engine, timer, red/non-red modes, 5 boards, online rooms, simulation-based agentic planner (Easy/Pro/Master/Adaptive + Agent Vision), RAG coach, CNN-style heatmap, 2-player mode, voice + keyboard control, AI telemetry, PWA.
Backend: api/coach.js (Groq proxy), api/leaderboard.js (Upstash Redis), api/health.js. server.js runs the same APIs in Docker.
Env: GROQ_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (all optional). Run: `docker compose up --build`.
