
# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serv
FROM nginx:alpine
RUN apk add --no-cache gettext

WORKDIR /usr/share/nginx/html

# Copy build
COPY --from=build /app/dist .

# Copy config
COPY runtime-config.js.tpl .
COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY nginx.conf /etc/nginx/conf.d/default.cong

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]