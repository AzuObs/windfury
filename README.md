![Windfury Logo](http://wow.zamimg.com/images/wow/icons/large/spell_shaman_unleashweapon_wind.jpg)

# Windfury

[![Codeship Status for mapleinside/windfury](https://codeship.com/projects/8c24abd0-c600-0133-5e12-4e8753dd3f97/status?branch=master)](https://codeship.com/projects/138622)

> Shamanize your next static website combining React and BrowserSync/Webpack tools.

Other compiler:

* [Felfire](https://github.com/mapleinside/felfire)

## What is Windfury?

Windfury is an advanced static website compiler. It's mainly focused on improving developer productivity by using [React](https://facebook.github.io/react/) as the technology behind his static compilation.
This compiler currently supports only [AWS S3](https://aws.amazon.com/s3/) for deployment.

Windfury uses among others [BrowserSync](https://www.browsersync.io/) and [Webpack](https://webpack.github.io/) in development environment.

You can find an [Yeoman generator](https://github.com/mapleinside/generator-static-website) to help you get started with Windfury's architecture.

## Features

### Entirely Customizable Babel Transpilation

Using [Babel](https://babeljs.io/), you can easily transpile your JavaScript sources with a defined configuration in your `.babelrc` file.
Windfury only used by default the plugin [React Transform HMR](https://github.com/gaearon/react-transform-hmr) to performs React Hot Reloading with Webpack.

### Advanced Sass Transpilation

[Sass](http://sass-lang.com/) is the only supported transpiler for doing styles in Windfury. However, you can still use native CSS instead.
The [PostCSS](http://postcss.org/)'s plugin [Autoprefixer](https://github.com/postcss/autoprefixer) extends the transpilation by automaticaly adding vendor prefixes to your CSS properties given a specific configuration.

### Base64 Transpilation of Images and Fonts Below a Maximum Size

If your app's images and fonts are below a given maximum size, they are converted in base64 to avoid additional HTTP requests.

### Gzip Compression

Before deploying to AWS S3, static assets are compressed with Gzip to dramatically cut into their sizes. The corresponding HTTP header is added in that case.

### Private Network Public Proxy with BrowserSync

Using BrowserSync, Windfury proxies your website when in development mode. As this, you can reach your website by using a private network accessible IP, then use the power of BrowserSync, like real time interactions. Just share the IP to your coworkers and see the magic happening!

### Hot Reloading

Thanks to React Transform HMR and Webpack, every updates to your sources are hot reloaded (JavaScripts or styles included). Hot Reloading is the capacity of makes changes in your website live without reloading.

### Inline Source Maps

Source Maps are a great way to debug your transpiled sources in development. They are not included in your production sources.

### Static Assets Cache-busting

To enable cache efficiency, if your production source files was modified since their last version, then their names will be replaced with a MD5 of their content.
This technique permits to cache your static assets into user browsers the maximum time possible without blocking updates.

### Resolving Environment Variables into Compiled Sources with Webpack

With the power of Webpack, you can use environment variables into your client JavaScript sources. Simply use `process.env.CUSTOM_ENVIRONMENT_VARIABLE` and Webpack will replace this entity by his value.
`NODE_ENV` is the only default variable.

### AWS S3 Deployment

When your compilation is done, Windfury will deploy it to your AWS S3 corresponding bucket, with the appropriate headers for caching and content type.

### Dynamic Routing

There's no need to trouble yourself with your website's router. Windfury takes care for you about it with its dynamic routing system. Just declare your [documents with the right structure](#website-architecture) and you're in business.

## How It Works?

### Installation

Windfury is a Node.js package that you need to install on your project as dependency:

```
npm install windfury --save-dev
```

Then, you'll need to create your Windfury configuration file named `windfury.yml`.
Add the following configuration as a new property:

```yaml
# The AWS configuration.
aws:

  # The name of your AWS S3 bucket that hosts your static assets.
  bucket: my-website.com/my-app
  
  # The region of your AWS S3 bucket that hosts your static assets.
  region: us-west-2
```

Note that your bucket name in AWS S3 should be prefixed with a locale identifier if you want to be able to use the [Windfury's i18n features](#internationalization). 

This options are mandatory to run Windfury.
There is a [full list of optional options](#advanced-configuration) to custom the compiler for your specific needs.

### Usage

The configuration is now done, so we can add the following NPM scripts in your `package.json` as well:

```json
"scripts": {
  "dev": "./node_modules/.bin/windfury watch",
  "build": "./node_modules/.bin/windfury build",
  "deploy": "./node_modules/.bin/windfury build --deploy"
}
```

The `windfury watch` build your website for development purpose then watch for file changes. `windfury build` build it for production purpose (without deployment), and `windfury build --deploy` builds and sends the website compiled sources to AWS S3.

#### Async Entry Point Hot Reloading

To enable full hot reloading on your async entry point, please specify this code in the top:

```javascript
if (module.hot) module.hot.accept();
```

#### AWS S3 Deployment

To be able to deploy with `windfury build --deploy` you need to specify the `AWS_ACCESS_KEY_ID` (your AWS access key ID) and `AWS_SECRET_ACCESS_KEY` (your AWS secret access key) environment variables. If not, Windfury can't authenticate itself with your AWS account.
A third environment variable, `DEPLOY_TO`, is mandatory to tell Windfury on which bucket to deploy.

#### Internationalization

<a name="internationalization"></a>Windfury is capable to compile your website for each locale you specify in its configuration.
Thanks to [Counterpart](https://github.com/martinandert/counterpart), it will set the locale on Counterpart's singleton in order to you to be able to translate your content.

Please note that each website translated version should be standalone versus each others, to performs the best of static website technologies. With this philosophy in mind, Windfury will deploy each website version to their respective AWS S3 bucket.
Your AWS S3 buckets need to be named as \[locale\].\[your-bucket-name-configuration\] (e.q. _fr.felfire.com_ for French translation). The default locale (the first index in array) will be deployed to a AWS S3 bucket without locale prefix, but with a _www_ prefix by default if not specified in advanced configuration.

If you don't want to translate your website, please do not specify locales in the configuration and name your AWS S3 bucket without locale prefix.

#### Available Options

* `--deploy`: enable deployment after a `windfury build`;
* `--debug`: enable debug logs when running Windfury.

### Advanced Configuration

<a name="advanced-configuration"></a>Windfury permits additional configuration, like the following:

```yaml
# This entry point corresponds to your async sources.
# You can import all your async modules in this file (e.q. Google Analytics).
async_entry_point: ./src/async.js

# The path to the source directory.
src_path: ./src

# The path to the dist directory.
dist_path: ./dist

# The path to the Babel configuration file.
babel_config_path: ./.babelrc

# The maximum size (in KB) before disabling base64 static assets encoding.
base64_maximum_size: 10000

# The Autoprefixer option for the PostCSS loader.
autoprefixer: last 2 version

# The level of image compression.
image_optimization_level: 7

# The level of the Gzip compression.
gzip_compression_level: 9

# The Gzip compression ratio between the original source versus the compressed source.
gzip_compression_ratio: 0.8

# Enable or not website's home page opening on Windfury start.
open_on_start: false

# Proxy configuration.
server:

  # The proxy port which by you can access to your project.
  port: 3000
    
  # The proxy UI port which you can access to BrowserSync configuration.
  ui_port: 3001
    
# An array of the environment variables you need to resolve 
# with Windfury. NODE_ENV is always resolved automaticaly.
# CUSTOM_ENVIRONMENT_VAR means that the value of this environment variable in your host is resolved.
# You can force a value by passing CUSTOM_ENVIRONMENT_VAR=forcedValue.
env:
  - CUSTOM_ENVIRONMENT_VAR
  - ...
  
# An array of locales to enable the i18n compilation.
# Windfury will compile your website with each locale on their respective directories,
# then, it will deploy each directory into its corresponding AWS S3 bucket.
# Note that the first locale will be the default one, with a AWS S3 bucket name
# without locale prefix.
locales:
  - en
  - fr
  - ...
  
# Add or not a www prefix to your default locale bucket.
default_bucket_with_prefix: true
```

### Website's Architecture

<a name="website-architecture"></a>Windfury works with a defined and strict architecture, not everything can be custom on your directory, file, and code structure.
Windfury helps you to maintain your static website, and it needs some architecture conventions to simplify its — and your — job.

#### File and Directory Structure

[...]

## License

(The MIT License)

Copyright (c) 2016 Maple Inside

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
