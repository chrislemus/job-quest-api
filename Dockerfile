FROM node:16.10.0-alpine As development

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install 

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:dev" ]

FROM node:16.10.0-alpine As production

COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package*.json ./
COPY --from=development /app/dist ./dist

EXPOSE 3001

CMD [ "npx", "prisma", "migrate","deploy","&&", "npm", "run", "start:prod" ]