# 🎷 grunt-saxicon

[![npm version](https://badge.fury.io/js/grunt-saxicon.svg)](https://badge.fury.io/js/grunt-saxicon)
![Build status](https://travis-ci.org/lachlanmcdonald/grunt-saxicon.svg?branch=master)

> grunt-saxicon takes a folder of SVGs and produces a SASS snippet that allows you to generate colorized SVGs within SASS embedded as a data-URI.

## Getting started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-saxicon --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-saxicon');
```


## Task

Add the following to your `Gruntfile.js`:

```js
require('load-grunt-tasks')(grunt);
grunt.initConfig({
	saxicon: {
		taskName: {
			source: "path/to/svgs/",
			scss: "path/to/saxicon.scss"
		}	
	}
});
```

Then in your SCSS files, import the SCSS output:

```scss
@include "path/to/saxicon";
```

You can then add data-URI encoded colorized SVGs as simple as:

```scss
.red-arrow {
    background-image: saxicon-background(arrow, red);
}
```
```css
.red-arrow {
	background-image: url("data:image/svg+xml,...");
}
```


## Options

**source**  
Type: `String`

Path to the directory which contains the SVG files.

- This path is not searched recursively
- It is highly recommended that you minify these files first using [grunt-svgmin]

**scss**  
Type: `String`  

Destination file for SCSS output.

**iconName**  
Type: `Function`

Optional callback function used to generate icon names for your SCSS and SVG files.


## Icon names

Each SVG will be named after the original  filename (without its extension).  
i.e. `arrow-left.svg` becomes `arrow-left`.

You can override how the names are produced by providing your own function to `iconName`:

```js
{
	iconName: function(fileName) {
		return fileName.replace(/^.*_(.*)\.svg$/, '$1');
	}
}
```

The function must return a valid [SASS map key](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#maps). (Will work when passed to [`map-get()`](http://sass-lang.com/documentation/Sass/Script/Functions.html#map_get-instance_method))


## Attributes vs. CSS

grunt-saxicon only works with the `fill` and `stroke` attributes. If you use `style` attributes, you can convert these to attributes using [svgo] or [grunt-svgmin].

Styles applied via the `<style>` tag are ignored.

## SASS

__saxicon-background__($icon, $color)

- **$icon** ([String](http://www.sass-lang.com/documentation/file.SASS_REFERENCE.html#sass-script-strings)): Icon name
- **$color** ([Color](http://www.sass-lang.com/documentation/file.SASS_REFERENCE.html#colors))

Returns the specified icon in the specified color as a data-URI. Colors are converted to a six-digit hex string (alpha is not included). Raises an error if the icon does not exist.

```scss
.red-arrow {
	background-image: saxicon-background(arrow, red);
}
```

```css
.red-arrow {
	background-image: url("data:image/svg+xml,...");
}
```

__saxicon-width__ ($icon)  
__saxicon-height__ ($icon)

- **$icon** ([String](http://www.sass-lang.com/documentation/file.SASS_REFERENCE.html#sass-script-strings)): Icon name

Returns the icon's width or height in pixels, as defined by the SVG's `width` and `height` attributes (or the `viewBox` attribute). This isn't guaranteed to be a whole-number if the SVG uses fractional dimensions. Raises an error if the icon does not exist.

```scss
.arrow {
	background-size: saxicon-width(arrow) saxicon-height(arrow);
	width: saxicon-width(arrow);
	height: saxicon-height(arrow);
}
```

```css
.arrow {
	background-size: 9px 12px;
	width: 9px;
	height: 12px;
}
```

__saxicon-classes__($color, $prefix: ".icon")

- **$color** ([Color](http://www.sass-lang.com/documentation/file.SASS_REFERENCE.html#colors))
- **$prefix** ([String](http://www.sass-lang.com/documentation/file.SASS_REFERENCE.html#sass-script-strings))

Outputs a class for every icon in the specified color.

- **$prefix** is prepended to every rule (defaults to `.icon-`).
- This mixin also outputs a `width`, `height` and `background-size` based on the SVG's original dimensions.

```scss
@include saxicon-classes(red, ".icon-red-");
```

```css
.icon-red-up-arrow {...}
.icon-red-left-arrow {...}
.icon-red-down-arrow {...}
.icon-red-right-arrow {...}
```


## Advanced options

> These options are secondary to colorizing and embedded SVGs in your CSS, but are included as they might come in handy for some projects.

**svgs.target**  
Type: `String`

If provided, colorizes and exports the SVGs into the directory provided. If provided, you must also specify the `svgs.colors`. See also: `outputPath`.

```js
{
	svgs: {
		target: "path/to/output",
		colors: {
			red: "#F00",
			green: "#0F0"
		}
	}
}
```

**svgs.colors**  
Type: `String`

An object of color-name pairs. Each key is the color's name, and its value the color that will be injected into the SVG files. See example above.

**outputPath**  
Type: `Function`

	Optional callback function used to generate the output path for exported SVGs. Paths are relative to the `svgs.target` property.

```js
{
	outputPath: function(filePath, iconName, colorName, color) {
		return iconName + '__' + colorName.toUpperCase() + '.svg';
	}
}
```

**json**  
Type: `String`

If provided, exports the intermediate SVG data in a single JSON file, which can be used for testing or as input for use with other tasks, etc.


### Outputting individual SVG files

Along with SASS, grunt-saxicon can also be used to colorize SVGs and output into a directory of your choosing. Suitable for embedding on a page or use with a CMS.

By default, SVG output will be named after the original file and the color name. For example, if you have `arrow-left.svg` and `arrow-right.svg` with the following properties:

```js
svgs: {
	colors: {
		red: "#F00",
		green: "#0F0"
	}
}
```

Will generate:

- `arrow-left.green.svg`
- `arrow-left.red.svg`
- `arrow-right.green.svg`
- `arrow-right.red.svg`

You can override the path and filenames with the `outputPath` option:

```js
svgs: {
	outputPath: function(filePath, iconName, colorName, color) {
		return iconName + '.' + colorName + '.svg';
	}
}
```

The function will receive these arguments for every icon-color combination:

- **filePath** (String): Path to the SVG, relative Grunt's current working directory (CWD). You can use npm's `path.basename()` if you want just the file-name.
- **iconName** (String): Icon name. Can be changed with the `iconName` option.
- **colorName** (String): Color's name. This is each key in the `colors` object.
- **color** (String): Color. The is each value in the `colors` object.


## Housekeeping

### Running tests

To run the tests, you will need both:

1. [Ruby SASS](http://sass-lang.com/install) — available in your environment as `sass`
2. A wrapper around [libsass](http://github.com/sass/libsass) (like [SassC](https://github.com/sass/sassc), which can be easily installed on macOS with [Homebrew](http://brewformulas.org/Sassc)) — available in your environment as `sassc`

To run the tests, use:

```sh
grunt test
```

### Support

Data URI-encoded SVG files using the above method is supported in all ever-green browsers (Chrome, Firefox, Safari and Edge) and Internet Explorer 9+.

### Best practices

You may find your generated CSS gets large if you reuse the same icon and color combination across a number of selectors.

Instead, extend a [placeholder selector](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#placeholder_selectors_):

```scss
%icon-arrow-red {
	background-image: saxicon-background(arrow, red);
	background-size: saxicon-width(arrow) saxicon-height(arrow);
	width: saxicon-width(arrow);
	height: saxicon-height(arrow);
}

.a {@extend %icon-arrow-red;}
.b {@extend %icon-arrow-red;}
.c {@extend %icon-arrow-red;}
```

```css
.a, .b, .c {
	background-image: url("data:image/svg+xml, ... ");
	background-size: 9px 12px;
	width: 9px;
	height: 12px;
}
```

You can also create placeholder selectors for every icon at once with the `saxicon-classes()` mixin:

```scss
@include saxicon-classes(red, '%icon-');

.a {@extend %icon-arrow;}
.b {@extend %icon-arrow;}
.c {@extend %icon-arrow;}
```

Keep in that mind that selectors which `@extend` placeholder selectors are included in your CSS output at the location where the placeholder selector was defined. Be mindful of specificity, if you wish to change these classes later.


### License

This code is distributed under the BSD-3-Clause license, as included below:

> Copyright (C) 2016, Lachlan McDonald. All rights reserved.
>
> grunt-saxicon can be downloaded from: https://github.com/lachlanmcdonald/grunt-saxicon
>
> Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
>
> - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
>
> - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
> - Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
>
> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

[svgo]: https://github.com/svg/svgo/
[grunt-svgmin]: https://github.com/sindresorhus/grunt-svgmin/
