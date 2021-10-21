FROM node:14

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY . .
RUN npm install && npm run build:prod:dangerous

# start app
CMD [ "npm", "run", "start:prod:dangerous" ]
