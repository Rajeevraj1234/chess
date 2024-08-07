FROM node:20-alpine

WORKDIR /usr/src/app/apps

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install typescript

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]