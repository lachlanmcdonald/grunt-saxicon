# 🎷 grunt-saxicon

> Process a folder of SVGs, producing colorised SVG files and SCSS mixins which can be used to encode the SVGs as data URI's and set fills and strokes in any color.

## Install

```sh
npm install --save-dev grunt-saxicon
```

## Usage

1. Add configuration as shown in the following section
2. Run task

```sh
grunt saxicon
```

If you have a `build` task, you should add `saxicon` before you compile your SASS. Likewise, if you use [grunt-contrib-watch](https://github.com/gruntjs/grunt-contrib-watch), you can watch your SVG directory and run the task when files change there too.

## Configuration

Add the following to your `Gruntfile.js`:

```js
require('load-grunt-tasks')(grunt);
grunt.initConfig({
	saxicon: {
	   source: "..." ,
       iconName: ...
	   json: "..." ,
	   scss: {
	       output: "..."
	   },
	   svgs: {
	       target: "..." ,
	       colors: [ ... ],
	       fileName: ...
	   }
	}
});
```

| Option | Description |
| ------ | ----------- |
| `source` | Path to directory which contains the target SVG files. Preferably, these files should be minified and cleaned-up first using [grunt-svgmin](https://github.com/sindresorhus/grunt-svgmin). |
| `json` | If provided, exports the intermediate SVG data as a JSON file, which can be used for testing or with other tasks, etc.
| `scss` | If provided, exports the SVGs for use in your SCSS. |
| `svgs` | If provided, colorises and exports the SVGs files, which can be used for testing or with other tasks, etc. |
| `scss.iconName` | Optional callback function used to generate icon names for your SCSS and SVG files. |

**scss**

| Option | Description |
| ------ | ----------- |
| `scss.output` | Path to the SCSS file which will receive both a SCSS map of the SVG files and mixins to simplify their use. |

**svgs**

| Option | Description |
| ------ | ----------- |
| `svgs.target ` | Path to the directory which will contain the generated SVGs. If provided, you must also specify the `svgs.colors` property. |
| `svgs.colors ` | An object of color-name pairs. Each key is the color's name, and its value the color that will be injected into the SVG files. |
| `svgs.fileName ` | A callback function which produces the output filenames (see sections below). |

## Icon Names

By default, each icon will be named after the original SVG's filename without its extension. i.e. `arrow-left.svg` becomes `arrow-left`.

For that reason, if you are ouputting SVGs to your SCSS, your file-names must be a valid [SASS map key](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#maps). That is to say, will work when passed to [`map-get()`](http://sass-lang.com/documentation/Sass/Script/Functions.html#map_get-instance_method).

You can specify how icon names are produced by overriding the `iconName` property.

```js
{
    iconName: function(fileName) {
		return fileName.replace(/^.*_(.*)\.svg$/, '$1');
	}
}
```

## SCSS

To use your SVG files in your SCSS, you will need to import the file you specified as the `output` property:

```scss
@include "path/to/saxicon-output";
```

### Functions

__saxicon-background__(_$icon_, _$color_)

Returns the specified icon with the specified color as a data-URI.
Will raise an error if the provided icon does not exist.

`$color` should be a valid color name or hex code. Whilst it is possible to use other color attributes it is likely that these will break the data-URI encoding.

```scss
.red-arrow {
    background-image: saxicon-background(arrow, red);
}
```
```css
.red-arrow {
    background-image: url("data:image/svg+xml, ... ");
}
```

__saxicon-width__(_$icon_)
__saxicon-height__(_$icon_)

Returns the icon's width\height in pixels, as defined by the original SVG's `viewbox` attribute. Note that this isn't guaranteed to be a whole-number if the SVG is uses fractional sizes.
Will raise an error if the provided icon does not exist.

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

### Mixins

__saxicon-classes__(_$color_, _$prefix_: ".icon")

Outputs a class for every icon in the specified color.

```scss
@include saxicon-classes(red, ".icon-red-");
```
```css
.icon-red-up-arrow {}
.icon-red-left-arrow {}
.icon-red-down-arrow {}
.icon-red-right-arrow {}
```

### Best practices

It isn't ideal to output the same data-URI multiple times if you are re-using the same icon and color combination across a number of selectors.

Instead, you can optimise your selectors by create and extending [placeholder selectors](http://sass-lang.com/documentation/file.SASS_REFERENCE.html#placeholder_selectors_):

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

You can also create placeholder selectors with the `saxicon-classes()` mixin:

```scss
@include saxicon-classes(red, '%icon-');

.a {@extend %icon-arrow;}
.b {@extend %icon-arrow;}
.c {@extend %icon-arrow;}
```

Keep in that mind that selectors which `@extend` placeholder selectors are included in your CSS output at the location where the placeholder selector was defined.

Whilst the above method is ideal for keeping SASS files small in size, it can create specificity issues if you try and overrule the instance later. Use the technique best suited to your requirements.

## Outputting SVG files

By default, SVG output will be named after the original file and the color name. For example, if you have `arrow-left.svg` and `arrow-right.svg` with the following properties:

```js
svgs: {
    colors: {
        red: "#F00",
        green: "#0F0"
    }
}
```
The following will be output:

- `arrow-left.green.svg`
- `arrow-left.red.svg`
- `arrow-right.green.svg`
- `arrow-right.red.svg`

You can override this by setting the `fileName` property:

```js
svgs: {
    fileName: function(fileName, iconName, colorName, color) {
        return iconName + '.' + colorName + '.svg';
    }
}
```

The function will receive these arguments for each  combination:

1. The original file-name
2. The icon-name, as defined by the `iconName` callback
3. The color name. That is, keys in the `colors` object
4. The color value. That is, values in the `colors` object

## License

This code is distributed under the BSD-3-Clause licence, as included below:

> Copyright (C) 2016, [Deloitte Digital](http://deloittedigital.com.au). All rights reserved.

> DDBreakpoints can be downloaded from: [https://github.com/DeloitteDigital/grunt-saxicon](https://github.com/DeloitteDigital/grunt-saxicon)

> Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

> - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

> - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

> - Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
