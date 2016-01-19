/*
 * grunt-saxicon
 * Copyright (c) 2016 Lachlan McDonald
 * Licensed under the BSD 3-Clause license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/*.js',
				'<%= nodeunit.tests %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp']
		},

		// Configuration to be run (and then tested).
		saxicon: {
			json: {
				options: {
					source: "test/src",
					json: "tmp/data.json",
				}
			},
			scss: {
				options: {
					source: "test/src",
					scss: {
						output: "tmp/_saxicon.scss"
					}
				}
			},
			svgs: {
				options: {
					source: "test/src",
					svgs: {
						target: "tmp/svgs/",
						colors: {
							red: "#F00",
							blue: "#00F",
							green: "#0F0"
						}
					}
				}
			}
		},

		// Unit tests.
		nodeunit: {
			tests: ['test/*_test.js']
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the "test" task is run, first clean the "tmp" dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'saxicon', 'nodeunit']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['clean', 'jshint', 'test']);
};
