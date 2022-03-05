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

RUN npm install -g @functionland/box

CMD ['npx','@functionland/box']

