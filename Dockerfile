# syntax=docker/dockerfile:1

FROM node:16-alpine
ENV NODE_ENV=production

COPY --from=golang:1.11.1-alpine3.8 /usr/local/go/ /usr/local/go/

ENV PATH="/usr/local/go/bin:${PATH}"

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

RUN ls && node common/scripts/install-run-rush.js update && node common/scripts/install-run-rush.js rebuild --verbose --to @functionland/fula-client-react || true


