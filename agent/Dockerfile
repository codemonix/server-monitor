FROM oven/bun:1-alpine
WORKDIR /app
COPY package*.json ./
RUN bun install --frozen-lockfile
COPY . .
ENV NODE_ENV=production
CMD ["bun", "src/index.ts"]
