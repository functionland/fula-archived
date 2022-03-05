# syntax=docker/dockerfile:1

FROM node:16
ENV NODE_ENV=production


COPY ./ /opt/fula
WORKDIR /opt/fula

RUN npm install -g @microsoft/rush && rush update && rush rebuild --verbose --to @functionland/fula-client-react || true

