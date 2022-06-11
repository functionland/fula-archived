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

## Test Scenario
Scenario and run them.
```
npm start [path to test file]
```

### Fula simple api test.
This is simple single box test to check all available API's.
Env Variables:
BOX_ID    required     box peerId.
TIME_OUT  optional     timeout for connection in milliseconds.

```
BOX_ID=[peerId] npm start src/fula.test.ts
```

