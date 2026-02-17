FROM node:22-slim
WORKDIR /app
COPY relay/package.json ./
RUN npm install --production=false
COPY relay/ .
EXPOSE 3211
CMD ["node", "--import", "tsx", "src/index.ts"]
