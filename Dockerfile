FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app /app
EXPOSE 9516
CMD ["node", "src/server.js"]
