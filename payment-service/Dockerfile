FROM node:22-alpine

WORKDIR /app

COPY payment-service/package*.json ./

RUN npm install

COPY payment-service/ .

COPY shared ./shared

CMD ["node", "payment.js"]
