<a name="README">[<img src="https://rawgithub.com/jasmine/jasmine/master/images/jasmine-horizontal.svg" width="400px" />](http://jasmine.github.io)</a>

[![Build Status](https://travis-ci.org/jasmine/jasmine.svg?branch=master)](https://travis-ci.org/jasmine/jasmine)
[![Open Source Helpers](https://www.codetriage.com/jasmine/jasmine/badges/users.svg)](https://www.codetriage.com/jasmine/jasmine)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjasmine%2Fjasmine.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjasmine%2Fjasmine?ref=badge_shield)

# A JavaScript Testing Framework

Jasmine is a Behavior Driven Development testing framework for JavaScript. It does not rely on browsers, DOM, or any JavaScript framework. Thus it's suited for websites, [Node.js](http://nodejs.org) projects, or anywhere that JavaScript can run.

Documentation & guides live here: [http://jasmine.github.io](http://jasmine.github.io/)
For a quick start guide of Jasmine, see the beginning of [http://jasmine.github.io/edge/introduction.html](http://jasmine.github.io/edge/introduction.html)

Upgrading from Jasmine 2.x? Check out the [3.0 release notes](https://github.com/jasmine/jasmine/blob/v3.0.0/release_notes/3.0.md) for a list of what's new (including breaking changes).

## Contributing

Please read the [contributors' guide](https://github.com/jasmine/jasmine/blob/master/.github/CONTRIBUTING.md)

## Installation

For the Jasmine NPM module:<br>
[https://github.com/jasmine/jasmine-npm](https://github.com/jasmine/jasmine-npm)

For the Jasmine Ruby Gem:<br>
[https://github.com/jasmine/jasmine-gem](https://github.com/jasmine/jasmine-gem)

For the Jasmine Python Egg:<br>
[https://github.com/jasmine/jasmine-py](https://github.com/jasmine/jasmine-py)

For the Jasmine headless browser gulp plugin:<br>
[https://github.com/jasmine/gulp-jasmine-browser](https://github.com/jasmine/gulp-jasmine-browser)

To install Jasmine standalone on your local box (where **_{#.#.#}_** below is substituted by the release number downloaded):

* Download the standalone distribution for your desired release from the [releases page](https://github.com/jasmine/jasmine/releases)
* Create a Jasmine directory in your project - `mkdir my-project/jasmine`
* Move the dist to your project directory - `mv jasmine/dist/jasmine-standalone-{#.#.#}.zip my-project/jasmine`
* Change directory - `cd my-project/jasmine`
* Unzip the dist - `unzip jasmine-standalone-{#.#.#}.zip`

Add the following to your HTML file:

```html
<link rel="shortcut icon" type="image/png" href="jasmine/lib/jasmine-{#.#.#}/jasmine_favicon.png">
<link rel="stylesheet" type="text/css" href="jasmine/lib/jasmine-{#.#.#}/jasmine.css">

<script type="text/javascript" src="jasmine/lib/jasmine-{#.#.#}/jasmine.js"></script>
<script type="text/javascript" src="jasmine/lib/jasmine-{#.#.#}/jasmine-html.js"></script>
<script type="text/javascript" src="jasmine/lib/jasmine-{#.#.#}/boot.js"></script>
```

## Supported environments

Jasmine tests itself across many browsers (Safari, Chrome, Firefox, Microsoft Edge, and new Internet Explorer) as well as nodejs. To see the exact version tests are run against look at our [.travis.yml](https://github.com/jasmine/jasmine/blob/master/.travis.yml)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/jasmine-js.svg)](https://saucelabs.com/u/jasmine-js)

## Support

* Search past discussions: [http://groups.google.com/group/jasmine-js](http://groups.google.com/group/jasmine-js)
* Send an email to the list: [jasmine-js@googlegroups.com](mailto:jasmine-js@googlegroups.com)
* View the project backlog at Pivotal Tracker: [http://www.pivotaltracker.com/projects/10606](http://www.pivotaltracker.com/projects/10606)
* Follow us on Twitter: [@JasmineBDD](http://twitter.com/JasmineBDD)

## Maintainers

* [Gregg Van Hove](mailto:gvanhove@pivotal.io), Pivotal Labs

### Maintainers Emeritus

* [Davis W. Frank](mailto:dwfrank@pivotal.io), Pivotal Labs
* [Rajan Agaskar](mailto:rajan@pivotal.io), Pivotal Labs
* [Greg Cobb](mailto:gcobb@pivotal.io), Pivotal Labs
* [Chris Amavisca](mailto:camavisca@pivotal.io), Pivotal Labs
* [Christian Williams](mailto:antixian666@gmail.com), Cloud Foundry
* Sheel Choksi

Copyright (c) 2008-2018 Pivotal Labs. This software is licensed under the MIT License.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fjasmine%2Fjasmine.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fjasmine%2Fjasmine?ref=badge_large)
