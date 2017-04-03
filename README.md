# 🎷 grunt-saxicon

[![npm version][npm-img]](https://badge.fury.io/js/grunt-saxicon)
![Build status][build-img]

> grunt-saxicon takes a folder of SVGs and produces a SASS snippet that allows you to generate colorized SVGs (with both single or multi-colored shapes) within SASS, embedded as a data-URI.

🌱 **This is a beta release**. For the last stable version, see [v0.2.5](https://github.com/lachlanmcdonald/grunt-saxicon/tree/v0.2.5).

<ul>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#options">Options</a></li>
    <li><a href="#sass">SASS</a></li>
    <li><a href="#advanced-options">Advanced options</a></li>
    <li><a href="#notes">Notes</a><ul>
        <li><a href="#colors-in-svgs">Colors in SVGs</a></li>
        <li><a href="#tests">Tests</a></li>
        <li><a href="#browser-support">Browser Support</a></li>
        <li><a href="#troubleshooting">Troubleshooting</a></li>
    </ul></li>
    <li><a href="#license">License</a></li>
</ul>

<h2 id="installation">Installation</h2>

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-saxicon@0.3.0-beta.2 --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-saxicon');
```

<h2 id="getting-started">Getting Started</h2>

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

### Single color SVGs

To output a SVG in a single color, you can call the `sax` function with a single color as shown below:

```scss
.red-arrow {
    background-image: sax(arrow, #F00);
}
```

Which will compile to:

```css
.red-arrow {
    background-image: url("data:image/svg+xml,...");
}
```

### Multi-color SVGs

To output a SVG in multiple colors, first you must replace the `stroke` and `fill` attributes in your SVG with a [color keyword][colors] — i.e. `red`, `magenta`, etc. The keyword you choose are used as a reference for when you want to replace that color in your SASS.

For example, with the following SVG:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
    <rect fill="red" x="0" y="0" width="10" height="10"/>
    <rect fill="blue" x="10" y="10" width="10" height="10"/>
</svg>
```

You can replace these colors in your SASS with:

```scss
.arrow {
    background-image: sax(arrow, $red: #d700ee, $blue: #9600bb);
}
```

By default, if you do not include a replacement color, the original color (as defined in the SVG) will be used instead. Whilst this is useful for debugging, you can also set a default color as the second argument for when a keyword is omitted:

```scss
.arrow {
    background-image: sax(arrow, #000, $red: #d700ee);
}
```

Additionally, you can use a [variable arguments][sass-var-args] for consistent theming:

```scss
$theme: ("red": #d700ee, "blue": #9600bb);

.arrow {
    background-image: sax(arrow, $theme...);
}
```

<h2 id="options">Options</h2>

**source**  
Type: `String`

Path to the directory which contains the SVG files.

- This path is not searched recursively.
- It is highly recommended that you minify these files first using [svgo] or [grunt-svgmin].

**scss**  
Type: `String`  

Destination for SCSS output.

**iconName**  
Type: `Function`

Optional callback function used to generate icon names for your SCSS and SVG files. By default, each SVG will be named after the original filename without its extension. i.e. `arrow-left.svg` becomes `arrow-left`.

Function receives the filename and should return the icon's name as a string.

```js
{
    iconName: function(fileName) {
        return fileName.replace(/^(.*)\.svg$/, '$1');
    }
}
```

**defaultColor**  
Type: `String`

Certain SVG shapes are presumed to have a fill, even if a `fill` attribute it not provided. By default, these shapes are given a fill of `black`. If provided, this option overrides the default value for the `fill` attribute.

(If no fill is desired, you should add `fill="none"` to the shape in your SVG.)

**autoColorNaming**  
Type: `Boolean`

By default, hex colors are replaced with their [SVG color keyword][colors] (i.e. `red` instead of `#F00`). If `false`, automatic replacements are not performed.

**preferGray**  
Type: `Boolean`

Optional. If `true`, automatic conversion of SVG color names will prefer "gr<u>a</u>y" over "gr<u>e</u>y." This option will not change colors that were already defined with a [SVG color keyword][colors].

<h2 id="sass">SASS</h2>

__sax__($icon, $keywords...)

- **$icon** ([String][sass-string]): Icon name
- **$keywords...** Color replacements, see below

Returns the specified icon, either in a single color or in multiple colors, as a data-URI. Colors are converted to a six-digit hex string (alpha is not included). Raises an error if the icon does not exist.

To replace a single color:

```scss
.arrow {
    background-image: sax(arrow, #000);
}
```

To replace with multiple-colors:

```scss
.arrow {
    background-image: sax(arrow, $red: #d700ee, $blue: #9600bb);
}
```

To replace with some colors and an optional default:

```scss
.arrow {
    background-image: sax(arrow, #000, $red: #d700ee);
}
```

__sax-width__ ($icon)  
__sax-height__ ($icon)

- **$icon** ([String][sass-string]): Icon name

Returns the icon's width or height in pixels, as defined by the SVG's `width` and `height` attributes (or the `viewBox` attribute). This isn't guaranteed to be a whole-number if the SVG uses fractional dimensions. Raises an error if the icon does not exist.

```scss
.arrow {
    background-size: sax-width(arrow) sax-height(arrow);
    width: sax-width(arrow);
    height: sax-height(arrow);
}
```

```css
.arrow {
    background-size: 9px 12px;
    width: 9px;
    height: 12px;
}
```

__sax-classes__($color, $prefix)

- **$color** ([Color]([sass-color]))
- **$prefix** ([String][sass-string]): Prepended to every rule. Defaults to `.icon-`.

Outputs a class for every icon in the specified color. This mixin also outputs a `width`, `height` and `background-size` based on the SVG's original dimensions.

```scss
@include sax-classes(red, ".icon-red-");
```

```css
.icon-red-up-arrow {...}
.icon-red-left-arrow {...}
.icon-red-down-arrow {...}
.icon-red-right-arrow {...}
```

<h2 id="advanced-options">Advanced options</h2>

> These options are secondary to colorizing and embedded SVGs in your CSS, but are included as they might come in handy.

**svgs.target**  
Type: `String`

If provided, colorizes and exports the SVGs in a single color into the directory provided. If provided, you must also specify the `svgs.colors`. See also: `outputPath`.

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

Optional callback function used to generate the output path for exported SVGs. Paths are relative to the `svgs.target` property. See below for more information.

**json**  
Type: `String`

If provided, exports the intermediate SVG data in a single JSON file. Useful for testing, or as input for use with other tasks, etc.

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

<h2 id="notes">Notes</h2>

<h3 id="colors-in-svgs">Colors in SVGs</h3>

grunt-saxicon only works with the `fill` and `stroke` attributes. If you use `style` attributes, you should first convert these to attributes using [svgo] or [grunt-svgmin].

Styles applied via the `<style>` tag are ignored.

By default, colors are converted to their [SVG color keyword][colors] (configurable with the `autoColorNaming` option). Some colors share the same keyword, as noted below:

- `cyan` is used instead of `aqua`
- `magenta` is used instead of `fushsia`
- Gr<u>e</u>y not gr<u>a</u>y. If you are feeling especially pedantic, you may use the `preferGray` option.

<h3 id="tests">Tests</h3>

To run the tests, you will need both:

1. [Ruby SASS](http://sass-lang.com/unstall) — available in your test environment as `sass`
2. A wrapper around [libsass](http://github.com/sass/libsass) (like [SassC](https://github.com/sass/sassc), which can be installed on macOS with [Homebrew](http://brewformulas.org/Sassc)) — available in your test environment as `sassc`

To run the tests:

```sh
grunt test
```

<h3 id="browser-support">Browser Support</h3>

Data URI-encoded SVG files are supported in all ever-green browsers (Chrome, Firefox, Safari, and Edge) and Internet Explorer 9+.

<h3 id="troubleshooting">Troubleshooting</h3>

#### SVG display issues in IE

SVGs, when resized using `background-size` sometimes clip beyond the element's boundaries or appear mis-aligned. This especially occurs when using a value of `cover` or `contain`.

Whilst not identical, values of `100% auto` or `auto 100%` (or absolute values in pixels) should to fix these display issues.

#### "Variable keyword argument map must have string keys"

When using [variable arguments][sass-var-args], keys must be strings, as shown below:

```scss
$theme: ("red": #d700ee, "blue": #9600bb);
```

With [certain versions of libsass](https://github.com/sass/libsass/issues/2352), you may recieve a `Segmentation fault: 11` error instead of the above error message.

#### Reducing redundancy in generated CSS

You may find your generated CSS can become large if you reuse the same icon and color combination across a number of selectors.

One solution is to extend a [placeholder selector](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#placeholder_selectors_):

```scss
%icon-arrow-red {
    background-image: sax(arrow, red);
    background-size: sax-width(arrow) sax-height(arrow);
    width: sax-width(arrow);
    height: sax-height(arrow);
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

You can also create placeholder selectors for every icon at once with the `sax-classes()` mixin:

```scss
@include sax-classes(red, '%icon-');

.a {@extend %icon-arrow;}
.b {@extend %icon-arrow;}
.c {@extend %icon-arrow;}
```

Keep in that mind that selectors which `@extend` placeholder selectors are included in your CSS output at the location where the placeholder selector was defined. Be mindful of specificity, if you wish to change these classes later.

<h2 id="license">License</h2>

This code is distributed under the BSD-3-Clause license, as included below:

> Copyright (C) 2017, Lachlan McDonald. All rights reserved.
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

[colors]: https://www.w3.org/TR/SVG/types.html#ColorKeywords
[svgo]: https://github.com/svg/svgo/
[grunt-svgmin]: https://github.com/sindresorhus/grunt-svgmin/
[npm-img]: https://badge.fury.io/js/grunt-saxicon.svg
[build-img]: https://travis-ci.org/lachlanmcdonald/grunt-saxicon.svg?branch=master
[sass-color]: http://sass-lang.com/documentation/file.SASS_REFERENCE.html#colors
[sass-string]: http://sass-lang.com/documentation/file.SASS_REFERENCE.html#sass-script-strings
[sass-var-args]: http://sass-lang.com/documentation/file.SASS_REFERENCE.html#variable_arguments
