# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --legacy-peer-deps
RUN cd backend && npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/backend ./backend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules

RUN mkdir -p /app/backend/uploads/cursos

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

VOLUME ["/app/backend/uploads"]

CMD ["node", "src/index.js"]
