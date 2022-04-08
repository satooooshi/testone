FROM node:14

WORKDIR /groupware-server
COPY package*.json /groupware-server
COPY yarn.lock /groupware-server

RUN yarn
CMD [ "yarn", "start:dev"]
