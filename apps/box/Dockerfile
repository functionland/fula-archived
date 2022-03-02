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

RUN ls && node common/scripts/install-run-rush.js install && node common/scripts/install-run-rush.js rebuild --verbose


WORKDIR ./apps/box

RUN cp -rL ./node_modules ./temp && rm ./node_modules && mv ./temp ./node_modules


FROM node:16-alpine AS builder

COPY --from=builder /opt/fula/apps/box /opt/box

CMD ['rushx','start']

