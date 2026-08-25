# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production serve stage using lightweight static server / nginx
FROM node:20-alpine AS preview

WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g vite

EXPOSE 3000

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
