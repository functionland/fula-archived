# Developer Guide
This repository managed by [rush](https://rushjs.io/) monorepo manager. this guide cover how you can start project but 
for mor information see [rush developer guide](https://rushjs.io/pages/developer/new_developer/).
project structure:

|Folder    | Description |
|----------|-------------|
|apps      | End User Application | 
|common    | Where rush manage its magic|
|docs      | Project Common Documentation |
|example   | Example Of how to use libraries|
|libraries | Developer's Libraries|
|protocols | Fula protocols describe how libp2p node communicates with each other|
|tools     | dope tools for handling fula|
Note: project structure is flat maximum depth of packages set by 2. 

## Getting started
1. Clone repository 
```sh
  git clone https://github.com/functionland/fula
```

2. Install rush globally
```sh
  npm install -g @microsoft/rush
```

3. rush update 
```sh
  rush update
```

4. rush build
```sh
   rush build
```

After completing step above you can use rushx command like npm. example:
```sh
   cd apps/server
   rushx start 
```

Note: Don't run npm command against the packages. it will break your dev environment. 

## Rush Command

Will provide soon

