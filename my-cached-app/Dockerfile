# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install express redis
COPY . .
CMD ["node", "server.js"]