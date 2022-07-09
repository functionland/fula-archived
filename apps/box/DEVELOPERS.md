# Getting Started

Use Server with caution and know the risk's becuse we are at development stage and the identity and encription is not avalibale 
so you become public node that can accessed from anywhere.

### Dependencies
Box must run alongside of ipfs and ipfs-cluster.
for having them use docker-compose.
```
docker compose up -d ipfs0 cluster0
```

By cloning repo and using rush (our monorepo manager) to build and run it. 
### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* `rush`
  ```sh
  npm install -g @microsoft/rush
  ```
* `node 16`
### Build

1. Clone the repo
   ```sh
   git clone https://github.com/functionland/fula.git
   ```
2. Install dependencies packages and build
   ```sh
   rush update
   rush build --to box
   
### Usage
Enter Server folder and start server
   ```sh
   cd apps/box 
   rushx start
   ```

### Private Fula network
To have a private network without exposing your private data to public ipfs First create a key file:
1. bash-script
```sh
  cd /opt/box/config
  echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > swarm.key
```
2. using go [ipfs-swarm-key-gen](https://github.com/Kubuxu/go-ipfs-swarm-key-gen)
3. using node [ipfs-swarm-key-gen](https://github.com/libp2p/js-libp2p/tree/master/src/pnet#from-a-module-using-libp2p)

After creating the key file open configuration and add path to it in config
```json
{
  ...
  "network":{
    "key_path": "./config/swarm.key", # Path to secret-key file
    ...
  },
  ...
}
```

### External IPFS
Need go-ipfs for peer routing:
```json
{
  ...,
  "ipfs": {
    "http": "" # external ipfs or ipfs-cluster proxy to use instead of js-ipfs
  }
  ...
}
```

### External IPFS
Need IPFS-cluster for high availability :
```json
{
  ...,
  "cluster": {
    "proxy": "" # external ipfs-cluster 
  }
  ...
}
```


## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


