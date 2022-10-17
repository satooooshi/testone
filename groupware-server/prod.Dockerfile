FROM node:14 AS builder
WORKDIR /groupware-server
COPY ./package*.json /groupware-server/
COPY ./yarn.lock /groupware-server/
RUN yarn
COPY ./nest-cli.json /groupware-server/
COPY . /groupware-server/
RUN yarn build

# for ncc
RUN yarn pack:ncc
RUN cp -r src/templates build/

# FROM node:14-alpine
# WORKDIR /groupware-server
# COPY ./ormconfig.js ./
# COPY --from=builder /groupware-server/dist ./
# COPY --from=builder /groupware-server/package.json ./
# # If the same version as yarn.lock is not specified in the typeorm, an error occurs when deploying.
# RUN yarn add typeorm@0.2.43

# CMD ["yarn", "start:prod-new"]
CMD ["yarn", "start:ncc"]
