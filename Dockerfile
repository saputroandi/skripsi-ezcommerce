FROM node:20-alpine

# small init to handle signals properly
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Install deps first (better cache)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy app source
COPY . .

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
