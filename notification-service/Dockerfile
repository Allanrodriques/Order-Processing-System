FROM node:22-alpine

WORKDIR /app

COPY notification-service/package*.json ./

RUN npm install

COPY notification-service/ .

COPY shared ./shared

CMD ["node", "notification.js"]
