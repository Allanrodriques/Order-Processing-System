FROM node:22-alpine

WORKDIR /app

COPY inventory-service/package*.json ./

RUN npm install

COPY inventory-service/ .

COPY shared ./shared

CMD ["node", "inventory.js"]
