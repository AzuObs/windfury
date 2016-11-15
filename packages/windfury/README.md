![Windfury Logo](https://static.mapleinside.com/windfury/windfury-logo.jpg)

# Windfury

[![CircleCI](https://circleci.com/gh/mapleinside/windfury.svg?style=svg)](https://circleci.com/gh/mapleinside/windfury)

> Shamanize your next static website with the most powerful React-based technologies.

Windfury is a full-featured and opinionated tooling library. It's mainly focused on improving developer experience (DX) on [React](https://facebook.github.io/react/)-based technologies. No more JavaScript fatigue. Just focus to build your website, don't worry about your tooling stack!

## Philosophy

* Single-dependency: [...]
* Opinionated: [...]
* Deployment pipeline support: [...]

## Features

* React stack based: [...]
* Live-reload and hot reloading: [...]
* CSS modules: [...]
* Deployment: [...]

## Quick Start

Let's start by create a new Node.js project. Windfury works great with the following boilerplate: [mapleinside/website-boilerplate](https://github.com/mapleinside/website-boilerplate).

However, if you want to start from scratch, Windfury is opinionated by nature, so you should follow Maple Inside's architecture conventions in order to use it.
When you're ready to go, install Windfury as local dependency:

```bash
npm i windfury --save-dev
```

Write the configuration's file _windfury.yml_ (see [Customization](#customization) for more information).
And finally, start the development server:

```bash
windfury start
```

`./src` is the main source directory. Start write code here!

## Commands

For best use, commands should be defined into the [package.json](https://docs.npmjs.com/files/package.json) as NPM scripts.

* `windfury start`: spin up a development server with live-reload and [HMR](http://webpack.github.io/docs/hot-module-replacement.html);
* `windfury build`: build a production-ready version of the website;
* `windfury deploy`: deploy your website sources to the specified [AWS S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html) bucket.

### Commands arguments

* `-e` or `--env-file`: use another _.env_ file instead of _./env/dev.env_. Useful to build a production-ready version of the app for the staging or production environment (e.q. `--env-file=./env/staging.env`).

### How Windfury Works

[...]

## Customization

Windfury uses a YAML file named _windfury.yml_ as configuration. You can easily custom many options here.
Below these are the mandatory options:

```yaml
aws:
  region: us-west-2
  s3:
    bucket: mywindfurywebsite.com
env:
  secret:
    - NPM_TOKEN
```

### Options

Here the full customizable options for Windfury:

```yaml
aws:
  region: us-west-2
  s3:
    bucket: mywindfurywebsite.com
env:
  secret:
    - NPM_TOKEN
```

## License

Windfury is [MIT licensed](./LICENSE).

Windfury documentation is [Creative Commons licensed](./LICENSE-docs).

Examples provided in this repository and in the documentation are [separately licensed](./LICENSE-examples).
