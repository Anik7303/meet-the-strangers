FROM node:14.20.0-alpine3.16

EXPOSE 8000

VOLUME /usr/app

ENV NODE_ENV=development
ENV HOST=192.168.0.100
ENV PORT=8000

WORKDIR /usr/app

COPY package.json .

RUN npm install && npm cache clear --force

COPY . .

CMD ["npm", "run", "start"]