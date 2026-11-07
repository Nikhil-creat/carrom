# CARROM-X v3 — by Nikhil Chary Sriramoju
Physics engine, timer, red/non-red modes, 5 boards, online rooms, simulation-based agentic planner (Easy/Pro/Master/Adaptive + Agent Vision), RAG coach, CNN-style heatmap, 2-player mode, voice + keyboard control, AI telemetry, PWA.
Backend: api/coach.js (Groq proxy), api/leaderboard.js (Upstash Redis), api/health.js. server.js runs the same APIs in Docker.
Env: GROQ_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (all optional). Run: `docker compose up --build`.
v5: learned shot-quality model (MLP trained on simulated shots: `npm run train`), undo/replay, best-of series, Elo rating, daily board, doubles, EN/HI/TE, tests (`npm test`).

## v8 — fixes & checks
- Fixed a load-order crash that stopped the game from starting (`rate` used before it existed).
- Online rooms: invite link (`?room=CODE`) + Share button, clear error messages, move retries, server wake-up ping, CORS list (`ALLOWED_ORIGIN`, `*` by default).
- `npm test` runs 21 tests: physics, a stubbed-browser smoke test of every mode and button, API (fake Upstash), asset/Docker/CSP consistency.
## Deploy
Frontend: Vercel (Framework: Other). Backend: Render (Docker, `render.yaml`). Put the Render URL in `config.js`.
Env on Render: GROQ_API_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ALLOWED_ORIGIN=*
