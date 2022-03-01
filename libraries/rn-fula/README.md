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



<div align="center">


<h3 align="center">Borg Client</h3>

  <p align="center">
    The Borg library abstracts away the protocols and `libp2p` connection, instead exposes APIs similar to MongoDB
    for data persistence and S3 for file storage. this package bridge fula functionality to react native using webview.

  </p>
</div>


### Built With

* [libp2p](https://libp2p.io/)
* [protocols](/protocols)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

Use Server with caution and know the risk's because we are at development stage and the identity and encryption is 
not available, so you become public node that can accessed from anywhere.


### Installation


Install NPM package
   ```sh
   npm install @functionland/rn-fula --save
   ```
or using CDN
  ```html
<script src="https://cdn.jsdelivr.net/npm/@functionland/rn-fula@0.2.2/dist/index.js"></script>
```
<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage
 fula client will be

   ```js
    // import provider
import Borg, {BorgContext} from '@functionland/rn-fula';
import React, {useContext} from 'react'
import {View} from 'react-native'

// add Borg Provider
const TopLevelComponent = (props) => {
  return (
          <View>
            <Borg>
              <App/>
            </Borg>
          </View>
  )
}

// Use rn Borg
const App = (props) => {
  fula = useContext(BorgContext)

  async function connect() {
    await fula.start()
    await fula.connect(serverId)
  }

  const onSend = async (e: any) => {
    let fileId = await fula.sendFile(image.uri)
    console.log(fileId)
  }

  const onReceiveFile = async (e: any) => {
    const file = await fula.receiveFile(fileId)
    console.log(await blobToBase64(file))
  }

  const onReceiveMeta = async (e: any) => {
    const meta =await fula.receiveMeta(fileId)
    console.log(meta)
  }
}

AppRegistry.registerComponent('WhateverName', () => TopLevelComponent)

   ```


_For more examples, please refer to the [Examples](/examples/react-native)_

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [X] Protocols
  - [X] File
  - [ ] Data
  - [ ] AI
- [ ] Identity
- [ ] Encryption


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
