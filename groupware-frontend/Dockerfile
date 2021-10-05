FROM node:14

WORKDIR /groupware-frontend

COPY package.json /groupware-frontend
COPY yarn.lock /groupware-frontend

RUN yarn

EXPOSE 3000

CMD ["yarn", "dev"]
