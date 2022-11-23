FROM node:14

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY . .
RUN yarn install && yarn build:prod:sandbox

# start app
CMD [ "npm", "run", "start:prod:sandbox" ]
