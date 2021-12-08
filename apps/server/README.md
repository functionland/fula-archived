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

[comment]: <> (  <a href="https://github.com/functionland/borg">)

[comment]: <> (    <img src="images/logo.png" alt="Logo" width="80" height="80">)

[comment]: <> (  </a>)

<h3 align="center">Borg Server</h3>

  <p align="center">
    Borg server turn your device to W3 node with configured IPFS server Which 
    <a href="https://github.com/functionland/borg/blob/main/libraries/borg">Borg client</a> 
    knows how to connect to it by its PeerID from anywhere. 
    <br />
    <a href="https://github.com/functionland/borg"><strong>Explore the docs »</strong></a>
    <br />
    <br />

[comment]: <> (    <a href="https://github.com/functionland/borg/blob/main/apps/server">View Demo</a>)

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

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* rush
  ```sh
  npm install rush -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/functionland/borg.git
   ```
2. Install dependencies packages and build
   ```sh
   rush install
   rush build
   ```

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage
 Enter Server folder and start server
   ```sh
   cd apps/server 
   rushx start
   ```


_For more examples, please refer to the [Documentation](https://example.com)_

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [*] Protocols
  - [*] File
  - [] Data
  - [] AI
- [] Identity
- [] Encryption


See the [open issues](https://github.com/functionland/borg/issues) for a full list of proposed features (and known issues).

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
[contributors-url]: https://github.com/functionland/borg/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/functionland/borg/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/functionland/borg/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/functionland/borg/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/functionland/borg/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png
