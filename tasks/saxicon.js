/*
 * grunt-saxicon 0.4.0-beta.1
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/grunt-saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const { Saxicon } = require('saxicon');

module.exports = function(grunt) {
	grunt.registerMultiTask('saxicon', function() {
		this.files.forEach((file) => {
			if (file.src.length === 0) {
				grunt.fail.warn('No input files found.');
			} else if (file.hasOwnProperty('dest') === false) {
				grunt.fail.fatal('Destination not set.');
			} else {
				grunt.log.debug(`Processing ${file.src.length} file(s)`);

				try {
					const sax = new Saxicon(this.options());
					const results = sax.parseSync(file.src);

					results.errors.map((x) => {
						grunt.log.error(`Unable to process: ${x.path}`.bold);

						x.errors.forEach(error => {
							let message = error.message ? error.message : error.toString();

							grunt.log.writeln(message.split(/\n/).map(x => `   ${x}`).join('\n'));
						});
					});

					grunt.file.write(file.dest, results.scss());
					grunt.log.debug(`Writing output to: ${file.dest}`);
				} catch (e) {
					grunt.log.error(e);
				}
			}
		});
	});
};
