FROM node:20-slim

ENV TZ Asia/Tokyo
RUN npm install -g pnpm

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN pnpm install

COPY . .
RUN npm run build

EXPOSE 5174

CMD ["npm", "run", "serve"]
