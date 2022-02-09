# syntax=docker/dockerfile:1

FROM node:16.13.2
ENV NODE_ENV=production

WORKDIR /borg

RUN npm install -g @microsoft/rush

COPY . .

RUN rush update

# by default rush build has non-zero exit code with warnings and this allows docker build to continue
ENV RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD=1

# fixing react-cra bypassing deps issue
ENV SKIP_PREFLIGHT_CHECK=true

RUN rush build
