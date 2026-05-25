FROM node:22-alpine

WORKDIR /app

COPY order-service/package*.json ./

RUN npm install

COPY order-service/ .

COPY shared ./shared

CMD ["node", "server.js"]
