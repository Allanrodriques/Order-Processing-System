FROM node:22-alpine

WORKDIR /app

COPY shipping-service/package*.json ./

RUN npm install

COPY shipping-service/ .

COPY shared ./shared

CMD ["node", "shipping.js"]
