FROM node:14

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY . .
RUN npm install && npm run build

# start app
CMD [ "npm", "run", "start:prod" ]
