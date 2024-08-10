FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json turbo.json ./

# copy all package.json from different apps
COPY apps/chess/package.json ./apps/chess/
COPY apps/backend/package.json ./apps/backend/
COPY apps/ws/package.json ./apps/ws/

# copy all package.json from packages 
COPY packages/db/package.json ./packages/db/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/store/package.json ./packages/store/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/
COPY packages/redis_queue/package.json ./packages/redis_queue/

RUN npm install

COPY . .

RUN npm run db:generate
RUN npm run redis:build

RUN npm run build

CMD [ "yarn" , "dev" ]