FROM node:14

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY . .
RUN yarn install && yarn run build:prod:dangerous

# start app
CMD [ "npm", "run", "start:prod:dangerous" ]
