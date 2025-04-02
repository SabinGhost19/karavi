FROM node:18.20-slim AS builder

WORKDIR /usr/local/app

COPY package*.json ./

ENV PATH="/usr/local/app/node_modules/.bin:$PATH"

RUN npm ci

COPY . ./
RUN npm run build --prod


FROM nginx:alpine
COPY --from=builder /usr/local/app/dist/frontend/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
