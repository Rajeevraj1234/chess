FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY turbo*.json ./

RUN npm install

COPY . .

RUN cd packages/db && npx prisma generate && cd ../..
RUN cd packages/redis_queue && npx tsc -b && node dist/index.js && cd ../..

RUN npm run build

CMD [ "yarn","dev"]