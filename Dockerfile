FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache bash curl openssl libc6-compat && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add infisical

COPY --from=build /app /app
EXPOSE 9516

CMD ["sh", "-c", "export INFISICAL_TOKEN=$(infisical login --domain https://app.infisical.com --method universal-auth --client-id $INFISICAL_UNIVERSAL_AUTH_CLIENT_ID --client-secret $INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET --silent --plain) && infisical run --domain https://app.infisical.com --projectId $INFISICAL_PROJECT_ID --env prod --path /ms6-notice-service -- node src/server.js"]
