![example workflow](https://github.com/functionland/box/actions/workflows/npm-test.yml/badge.svg)

# box

Client-server stack for Web3

[Intro blog](https://dev.to/fx/google-photos-open-source-alternative-with-react-native-80c#ending-big-techs-reign-by-building-opensource-p2p-apps)

[Flagship App: Photos](https://github.com/functionland/photos)

![client-server resemblance](https://user-images.githubusercontent.com/1758649/126010892-b7bf9905-0044-472d-aeb6-1ed7e66268d8.png)

![box server demo](https://user-images.githubusercontent.com/1758649/126008513-e5f8f2eb-b931-4450-8373-6102cf47e7d1.png)

## Motivation

There are currently two ways to interact with Web3 storage solutions:

1. Through a pinning service and a gateway: the advantage is that files are served through URLs, an app can then access the files with conventional methods, e.g. simply putting a picture in `<img src="gateway.example.com/Qm...">`. The disadvantage is that there is a subscription payment associated with pinning services. Also this is not really decentralized!
2. Turn the device to a full IPFS node: this model works beautifully in Brave desktop browser as an example, and makes sense for laptop and PC since they normally have large HDDs. It's much harder on mobile devices, however, biggest hurdle is to have Apple on board with the idea of relaxing file system access in iOS! Even if all goes well, a mobile device is NOT a good candidate for hosting the future Web! They get lost easily and are resource constrained (battery, memory).

**box** aims to address these issues by creating a third alternative: **Personal Server**

A personal server is a commodity hardware (PC, Raspberry Pi, etc.) that's kept *at home* vs. *in pocket*. It helps with actual decentralization, also saves money since people pay once for HDDs and own them forever, no monthly charge! From privacy perspective, it guarantees that data doesn't leave the premise unless user specifically wants to (e.g. sharing).

To achieve this, we are developing protocols to accommodate client-server programming with minimal effort on developer's side:

- [File Protocol](protocols/file): Send and receive files in a browser or an app **(stage: prototype)**
- [Data Protocol](protocols/data): Database interface over at client-side; facilitates describing linked JSON documents and having them saved/retrieved **(stage: design draft)**
- [AI Protocol](protocols/ai): Map-Reduce stack for distributed processing **(stage: ideation)**

## Architecture

![box architecture](https://user-images.githubusercontent.com/1758649/126281564-a3a5aea9-50a6-4ae9-ae2b-439977d57980.jpg)

An app talks with the server(s) by invoking APIs from `@functionland/borg` library. The Borg library abstracts away the protocols and `libp2p` connection, instead exposes APIs similar to MongoDB for data persistence and S3 for file storage.

On the server side, data or file will be saved on a private IPFS instance. There is also a public IPFS instance which comes to play in sharing: when the end user requests to share some data, an encrypted copy will be saved on the public IPFS network, anyone with whom the key has been shared can access the data.

The **box** stack can provide backup guarantees by having the data pinned on multiple servers owned by the user. However, in cases that the user needs absolute assurance on data longevity, e.g. password records in a password manager app or scans of sensitive documents, the encrypted data can be sent over at Filecoin blockchain.

## Packages

| Name | Description |
| --- | --- |
| [protocols](protocols) | Libp2p protocols for the box stack |
| [server](apps/server) | Reference server implementation in Node.js |
| [borg](libraries/borg) | Client library for using the protocols from browser |
| [rn-borg](libraries/rn-borg) | Client library ported for react native |


## Examples

| Name | Description |
| --- | --- |
| [react](examples/react-cra) | Example of using borg client and box server |
| [react-native](examples/react-native) | Example of using borg client in react-native and box server |

## Development

To get started in development with this monorepo use the following steps.

### Prerequisites

  * [nodejs](https://nodejs.org/en/) version 16.13.2

  * [rush](https://www.npmjs.com/package/@microsoft/rush) monorepo tool

### Local development on host OS

1.  Install & Build deps

```
  $ rush update && rush build
```

2. Run box app.

```
  $ cd apps/box && rushx start
```

3. Run demo apps

```
  $ cd examples/react-cra && rushx start
  $ cd examples/react-do-app && rushx start
```



### Local development in docker container

```
  $ docker-compose -f docker-compose.dev.yaml up
```

### Run the demo apps

Open a browser and navigate to ```http://localhost:3000``` and ```http://localhost:3001```

## License

[MIT](LICENSE)

## Related Publications and News

- https://filecoin.io/blog/posts/249k-for-17-projects-from-dorahacks-filecoin-grant-hackathon/
- https://dev.to/fx/google-photos-open-source-alternative-with-react-native-80c
- https://hackernoon.com/were-building-an-open-source-google-photos-alternative-with-react-native-zw4537pa
- https://crustnetwork.medium.com/crust-network-and-functionland-partnering-up-on-web3-developer-tools-309e41074fc5
