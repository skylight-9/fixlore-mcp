FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json server.mjs tools.mjs ./
USER node
ENTRYPOINT ["node", "server.mjs"]
