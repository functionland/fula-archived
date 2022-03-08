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


<h3 align="center">Fula Client</h3>

  <p align="center">
    The Fula library abstracts away the protocols and `libp2p` connection, and exposes APIs similar to MongoDB
    for data persistence and S3 for file storage
    <br />
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
   npm install @functionland/fula --save
   ```
or using CDN
  ```html
<script src="https://cdn.jsdelivr.net/npm/@functionland/fula/dist/index.js"></script>
```
<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage
 Start fula and use file storage of [fula-server](/apps/server)
   ```js
    import {Fula, createClient} from '@functionland/fula'

    // Create a fula client 
    const fulaClient = await createClient();
    // ...
    // connect to a fula server by its base58 string PeerId
    await fulaClient.connect(serverId)
    // send file and get cid
    // selectedFile send file use StreamReader interface or AsyncItrable and get cid
    // meta {name,type,lastModified,size}
    const FileCid = await fulaClient.sendStreamFile(selectedFile,meta);
    // recive meta data 
    const data = await fulaClient.receiveMeta(fileId);
    // recive file using cid
    const data = await fulaClient.receiveFile(FileCid);
    let reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onloadend = (e) => setContent(reader.result)
   ```


_For more examples, please refer to the [Examples](/examples/react-cra)_

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

See [`LICENSE`](/LICENSE) for more information.

<p align="right">(<a href="#top">back to top</a>)</p>





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
