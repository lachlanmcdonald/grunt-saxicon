/*
 * grunt-saxicon 0.4.0-beta.1
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/grunt-saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		clean: {
			tests: ['tmp']
		},
		saxicon: {
			test: {
				files: {
					'tmp/test.scss': 'test/svgs/*.svg'
				}
			}
		},
		nodeunit: {
			tests: ['test/test_*.js']
		}
	});

	// Load tasks
	grunt.loadTasks('tasks');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Test
	grunt.registerTask('test', [
		'clean',
		'nodeunit'
	]);

	// By default, run tests
	grunt.registerTask('default', [
		'test'
	]);
};
