FROM node:16.8.0-alpine As development

COPY package*.json ./

RUN npm install 

COPY . .

CMD [ "npm", "run", "start:dev" ]