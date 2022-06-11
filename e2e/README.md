# Running Test against Box with JS-Fula
This project uses [fula-client](https://docs.fx.land/api/client-instance) and [tape](https://github.com/substack/tape) to run full api test with box.

## Prerequisite
Some dependencies depend on native addon modules, so you'll also need to meet node-gyp's installation prerequisites.

- https://github.com/nodejs/node-gyp#installation

## Install 
If using rush:
```shell
rush install && rush update
```
If using npm:
```shell
npm install
```

## RUN
With rush:
```shell
rushx start
```
With npm:
```shell
npm start
```

## Roadmap
- [ ] Add cli to select scenario user want to run 
