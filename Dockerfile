FROM node:20-alpine
WORKDIR /app
COPY server.js vercel.json index.html style.css app.js sw.js manifest.webmanifest icon.svg ml.js model.json closing.css closing.js package.json ./
COPY api ./api
USER node
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://localhost:8080/api/health >/dev/null || exit 1
CMD ["node","server.js"]
