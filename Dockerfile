FROM node:10.13-alpine

LABEL name="Restify-API-server"

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN apk add --update \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& npm install \
&& apk del .build-deps

COPY . .

ENV AWS_ACCESS_KEY_ID= \
	AWS_SECRET_ACCESS_KEY= \
	AWS_REGION=

CMD [ "node", "server.js" ]
