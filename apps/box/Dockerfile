FROM node:16-alpine3.8

COPY --from=golang:1.16.4-alpine3.8 /usr/local/go/ /usr/local/go/

ENV PATH="/usr/local/go/bin:${PATH}"

RUN apk --no-cache --virtual build-dependencies add \
    python2 \
    make \
    g++ \
    git \
    openssh

RUN apk add --no-cache git make bash gcc musl-dev \
  && go get -u github.com/whyrusleeping/gx

# Fixes an issue with symlinked binaries not playing well with musl
# Thanks https://stackoverflow.com/questions/34729748/installed-go-binary-not-found-in-path-on-alpine-linux-docker
RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2

# Download public key for github.com
RUN mkdir -p /root/.ssh && \
    chmod 0700 /root/.ssh && \
    ssh-keyscan github.com >> /root/.ssh/known_hosts

RUN npm install -g @functionland/box

CMD ['npx','@functionland/box']

