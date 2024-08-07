FROM node:20-alpine


WORKDIR /usr/src/app/apps

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install typescript

RUN npm run build

EXPOSE 5173

CMD [ "npm","run","dev" ]