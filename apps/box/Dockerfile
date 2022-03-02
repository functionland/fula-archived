FROM node:16-alpine AS builder

RUN apk --no-cache --virtual build-dependencies add \
    python2 \
    make \
    g++ \
    git \
    openssh

# Download public key for github.com
RUN mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh && \
    ssh-keyscan github.com >> /root/.ssh/known_hosts

COPY ./ /opt/fula
WORKDIR /opt/fula

RUN ls && node common/scripts/install-run-rush.js update && node common/scripts/install-run-rush.js rebuild --verbose --to @functionland/box || true

WORKDIR ./apps/box

RUN cp -rL ./node_modules ./temp && rm -rf ./node_modules && mv ./temp ./node_modules


FROM node:16-alpine

COPY --from=builder /opt/fula/apps/box /opt/box
WORKDIR /opt/box
RUN npm install
RUN npm install uint8arrays
RUN npm run build

CMD ['npm','start']

