FROM node:14 AS builder
WORKDIR /groupware-server
COPY ./package*.json /groupware-server/
COPY ./yarn.lock /groupware-server/
RUN yarn
COPY . /groupware-server/
RUN yarn build

FROM node:14-alpine
WORKDIR /groupware-server
COPY ./ormconfig.js ./
COPY --from=builder /groupware-server/dist ./
COPY --from=builder /groupware-server/package.json ./
RUN yarn add typeorm
CMD ["yarn", "start:prod"]
