# syntax=docker/dockerfile:1

# ---------- deps ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV TZ=Asia/Ho_Chi_Minh
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ----------
# NEXT_PUBLIC_* được NHÚNG vào bundle ở bước này, nên phải truyền qua build-arg.
# Đổi domain API = phải BUILD LẠI image (không sửa được bằng env lúc chạy).
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV TZ=Asia/Ho_Chi_Minh
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT \
    NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=$NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `next build` trực tiếp (không qua scripts/next-build.mjs) để distDir mặc định `.next`,
# nên output standalone nằm đúng `.next/standalone` như Dockerfile này dùng.
RUN npx next build

# ---------- runner ----------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV TZ=Asia/Ho_Chi_Minh
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone: server tối thiểu + node_modules đã lọc sẵn
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

RUN chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
