# Change log

### Version 0.4.0-beta.1 — 19/04/2018

- Replaced task with new [saxicon][saxicon] module.
  - Improved DOM traversal accuracy
  - Proper inheritance of styles on `<g>`
- The depth of tests have been replaced with a smoketest. Tests can be more accurately tested on the [saxicon][saxicon] module.
- The following features have been removed from `grunt-saxicon`:
  - Export SVGs as JSON
  - Export colorised SVGs directly from the task

### Version 0.3.0 — 17/06/2017

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

[saxicon]: https://github.com/lachlanmcdonald/saxicon
