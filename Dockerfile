FROM node:20-slim

ENV TZ Asia/Tokyo
RUN npm install -g pnpm

WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN npm run build

ENV PUBLIC_UPSTREAM_URL_BASE http://robiemon-server:3000

EXPOSE 8000

CMD ["npm", "run", "serve"]
