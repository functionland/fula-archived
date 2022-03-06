FROM node:16

RUN mkdir -p /app
WORKDIR /app
RUN npm install @functionland/box

VOLUME /app/data

EXPOSE 4002
EXPOSE 4003
EXPOSE 5002
EXPOSE 9090

CMD ['node', './node_modules/@functionland/box/dist/index.js']

