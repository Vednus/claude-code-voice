FROM node:22-slim
WORKDIR /app
COPY relay/package*.json ./
RUN npm ci
COPY relay/ .
EXPOSE 3211
CMD ["node", "--import", "tsx", "src/index.ts"]
