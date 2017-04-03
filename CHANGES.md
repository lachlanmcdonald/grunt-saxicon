# Change log

### Version 0.3.0-beta.4

🌱 **This is a beta release**

- Multi-color SVG support.
- Removed *grunt-contrib-jshint*. Too many vulnerabilities. [eslint](http://eslint.org/) is prefered instead.
- Icons names are always treated as strings in SASS.

For compatibility:

- `sax-classes()` mixin replaces `saxicon-classes()`
- `sax-width()` function replaces `siconax-width()`
- `sax-height()` function replaces `saiconx-height()`
- `sax` function replaces `saxicon-background()`

### Version 0.2.5 — 04/12/2016

- Integration with Travis CI
- Fixed documentation
- Updated license

### Version 0.2.4 — 01/12/2017

- Updated dependant version of `grunt`, `grunt-contrib-clean`, `grunt-contrib-jshint`, `grunt-contrib-nodeunit`. Namely, `grunt-contrib-jshint@0.9.2` still had the DoS vulnerability.

### Version 0.2.3 — 30/11/2017

- `scss.output` option is now `scss`.
- Updated dimension handling to first use `width` & `height` attributes. If unavailable, attempt to parse these values from the `viewBox` attribute.
- Re-wrote documentation.
- Added and improved existing unit-tests.
- Removed lodash dependency from unit-tests.
- Removed handlebars dependency.
- Updated dependencies to fix Regular Expression DoS vulnerabilities in *minimatch* package.

Versions 0.2.0—0.2.3 are identical. Only documentation has changed.

### Version 0.1.0 — 16/05/2017

- First release.
