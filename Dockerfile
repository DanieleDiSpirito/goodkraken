# ==========================
# Stage 1: Builder
# ==========================
FROM node:18-alpine AS builder

WORKDIR /app

# Copia solo package.json e lockfile
COPY package.json package-lock.json* yarn.lock* ./

# Installa tutte le dipendenze
RUN npm install

# Copia i file di progetto
COPY . .

# Build dell'app
RUN npm run build

# ==========================
# Stage 2: Runner (Produzione)
# ==========================
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production


# Copia file dal builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Installa solo le dipendenze di produzione
RUN npm ci --only=production

# Installa ngrok
RUN npm install -g ngrok

EXPOSE 3000

# Comando di avvio: Next.js
CMD sh -c "npm run start"
