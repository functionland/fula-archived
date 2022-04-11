# syntax=docker/dockerfile:1
FROM node:16 AS builder
ENV NODE_ENV=production


COPY ./ /opt/fula
WORKDIR /opt/fula

RUN npm install -g @microsoft/rush && rush update && rush rebuild --verbose --to @functionland/fula-client-react --to @functionland/box

RUN rush deploy


FROM node:16
COPY --from=builder /opt/fula/common/deploy /opt/

WORKDIR /opt/apps/box

VOLUME /opt/apps/box/data
VOLUME /opt/apps/box/config

EXPOSE 4002
EXPOSE 4003
EXPOSE 5002
EXPOSE 9090

CMD ["node", "./dist/index.js"]

