FROM node:alpine3.10

COPY package*.json .

WORKDIR /app

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "simple-backend.js"]