# 🎷 grunt-saxicon

[![npm version](https://badge.fury.io/js/grunt-saxicon.svg)](https://badge.fury.io/js/grunt-saxicon)
[![License](https://img.shields.io/npm/l/grunt-saxicon.svg)](https://github.com/lachlanmcdonald/grunt-saxicon/blob/master/LICENSE)

<p style="color: red;"><b>Deprecation warning</b>: This module is no longer maintained and will not receive any further security updates or fixes.</p>

> **grunt-saxicon** is a wrapper for [saxicon][saxicon], a module which transforms SVGs into a SASS snippet that allows you to generate colorized SVGs (with both single or multi-colored shapes) within SASS, with each SVG embedded as a data-URI.

## Installation

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-saxicon
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-saxicon');
```

## Getting started

Add the following to your `Gruntfile.js`:

```js
require('load-grunt-tasks')(grunt);
grunt.initConfig({
    saxicon: {
        foo: {
            options: {},
            files: {
                'path/for/output.scss': 'path/to/svgs/*.svg'
            }
        }
    }
});
```

Then in your SCSS files, import the SCSS output:

```scss
@include "path/for/output.scss";
```

## Task options

Options are passed directly to the [saxicon][saxicon] module. See the [Saxicon Options][saxicon-options] documentation.

## Tests

A smoketest is provided for integration purposes. For comprehensive tests, see the [saxicon][saxicon] module.

```sh
grunt test
```

[saxicon]: https://github.com/lachlanmcdonald/saxicon
[saxicon-options]: https://github.com/lachlanmcdonald/saxicon/wiki/Saxicon-class#options
