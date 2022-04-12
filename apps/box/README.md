<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
*** Nice Template: https://github.com/othneildrew/Best-README-Template
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[comment]: <> ([![Contributors][contributors-shield]][contributors-url])

[comment]: <> ([![Forks][forks-shield]][forks-url])

[comment]: <> ([![Stargazers][stars-shield]][stars-url])

[comment]: <> ([![Issues][issues-shield]][issues-url])

[comment]: <> ([![License][license-shield]][license-url])

[comment]: <> ([![LinkedIn][linkedin-shield]][linkedin-url])



[comment]: <> (<!-- PROJECT LOGO -->)

[comment]: <> (<br />)
<div align="center">

[comment]: <> (  <a href="https://github.com/functionland/fula">)

[comment]: <> (    <img src="images/logo.png" alt="Logo" width="80" height="80">)

[comment]: <> (  </a>)

<h3 align="center">Fula Server</h3>

  <p align="center">
    Fula server turn your device to W3 node with configured IPFS server Which 
    <a href="https://github.com/functionland/fula/blob/main/libraries/fula">Fula client</a> 
    knows how to connect to it by its PeerID from anywhere. 
    <br />
    <a href="https://github.com/functionland/fula"><strong>Explore the docs »</strong></a>
    <br />
    <br />

[comment]: <> (    <a href="https://github.com/functionland/fula/blob/main/apps/server">View Demo</a>)

[comment]: <> (    ·)

[comment]: <> (    <a href="https://github.com/github_username/repo_name/issues">Report Bug</a>)

[comment]: <> (    ·)

[comment]: <> (    <a href="https://github.com/github_username/repo_name/issues">Request Feature</a>)
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>

[comment]: <> (    <li><a href="#contact">Contact</a></li>)

[comment]: <> (    <li><a href="#acknowledgments">Acknowledgments</a></li>)
  </ol>
</details>




### Built With

* [libp2p](https://libp2p.io/)
* [IPFS](https://ipfs.io/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Use Server with caution and know the risk's becuse we are at development stage and the identity and encription is not avalibale 
so you become public node that can accessed from anywhere.

### Option 1
By cloning repo and using rush (our monorepo manager) to build and run it. 
#### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* `rush`
  ```sh
  npm install -g @microsoft/rush
  ```
* `node 16`
#### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/functionland/fula.git
   ```
2. Install dependencies packages and build
   ```sh
   rush update
   rush build --to box
   ```

<!-- USAGE EXAMPLES -->
#### Usage
Enter Server folder and start server
   ```sh
   cd apps/box 
   rushx start
   ```
   

<p align="right">(<a href="#top">back to top</a>)</p>

### Option 2
Using npm
#### Installation
1. Install it globally
```sh
npm install -g @functionland/box
```
2. Create directory for its data and config
```sh
mkdir -p /opt/box
cd /opt/box
```
3. Create config folder and create `default.json` 
```sh
cd /opt/box
mkdir config
touch config/default.json
```
And copy this config into it.
```json
{
  "nodes": [],
  "network":{
    "key_path": "",
    "listen": [
      "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
      "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star"
    ]
  },
  "ipfs": {
    "http": ""
  }
}
```
#### Usage
```sh
cd /opt/box
npx @functionland/box
```

## Config
###Overview
```json
{
  "nodes": [], # List of multiaddresses of other box and ipfs node in your network.  
  "network":{
    "key_path": "", # Path to secret-key file
    "listen": [
      "/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star",
      "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star"
    ] # List of multiaddresses libp2p and ipfs listen on
  },
  "ipfs": {
    "http": "" # external ipfs or ipfs-cluster proxy to use instead of js-ipfs 
  }
}
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
After adding this you have to add other network node multiaddresses manually for your network to join.

```json
{
  ...
  "ipfs": {
    "http": "" # external ipfs or ipfs-cluster proxy to use instead of js-ipfs
  }
  ...
}
```

### External IPFS
If you want to use an external ipfs like go-ipfs or ipfs-cluster proxy api set Http RPC api of your external node:
```json
{
  ...
  "nodes": [] # List of multiaddresses of other box and ipfs node in your network.
  ...
}
```


_For more examples, please refer to the [Documentation](https://docs.fx.land)_

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [X] Protocols
  - [X] File
  - [X] Graphql


See the [open issues](https://github.com/functionland/fula/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>



[comment]: <> (<!-- CONTACT -->)

[comment]: <> (## Contact)

[comment]: <> (Your Name - [@twitter_handle]&#40;https://twitter.com/twitter_handle&#41; - email@email_client.com)

[comment]: <> (Project Link: [https://github.com/github_username/repo_name]&#40;https://github.com/github_username/repo_name&#41;)

[comment]: <> (<p align="right">&#40;<a href="#top">back to top</a>&#41;</p>)



[comment]: <> (<!-- ACKNOWLEDGMENTS -->)

[comment]: <> (## Acknowledgments)

[comment]: <> (* []&#40;&#41;)

[comment]: <> (* []&#40;&#41;)

[comment]: <> (* []&#40;&#41;)

[comment]: <> (<p align="right">&#40;<a href="#top">back to top</a>&#41;</p>)



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/functionland/fula/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/functionland/fula/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/functionland/fula/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/functionland/fula/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/functionland/fula/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
