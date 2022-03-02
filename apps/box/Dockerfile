FROM node:16-alpine AS builder

COPY ./ /opt/fula
WORKDIR /opt/fula

RUN ls && node common/scripts/install-run-rush.js install && rush update

RUN rush build -t box

WORKDIR ./apps/box

RUN cp -rL ./node_modules ./temp && rm ./node_modules && mv ./temp ./node_modules


FROM node:16-alpine AS builder

COPY --from=builder /opt/fula/apps/box /opt/box

CMD ['rushx','start']

