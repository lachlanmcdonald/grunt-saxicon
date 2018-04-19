/*
 * grunt-saxicon 0.4.0-beta.1
 * Copyright (c) 2017 Lachlan McDonald
 * https://github.com/lachlanmcdonald/grunt-saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */

'use strict';

module.exports = function(grunt) {
	grunt.initConfig({

		// Before generating any new files, remove any previously-created files.
		clean: {
			tests: ['tmp']
		},

		// Configuration to be run (and then tested).
		saxicon: {
			test_json: {
				options: {
					source: 'test/src',
					json: 'tmp/test_json/data.json'
				}
			},
			test_json2: {
				options: {
					source: 'test/src',
					json: 'tmp/test_json2/data.json',
					iconName: function(fileName) {
						return fileName.replace(/^(.*)\.svg$/, '$1-test');
					}
				}
			},
			test_scss_ruby: {
				options: {
					source: 'test/src',
					scss: 'tmp/test_scss_ruby/_saxicon.scss'
				}
			},
			test_scss_libsass: {
				options: {
					source: 'test/src',
					scss: 'tmp/test_scss_libsass/_saxicon.scss'
				}
			},
			test_svgs: {
				options: {
					source: 'test/src',
					svgs: {
						target: 'tmp/test_svgs/svgs/',
						colors: {
							red: '#F00',
							blue: '#00F',
							green: '#0F0'
						}
					}
				}
			},
			test_svgs2: {
				options: {
					source: 'test/src',
					outputPath: function(filePath, iconName, colorName) {
						return iconName + '__' + colorName.toUpperCase() + '.svg';
					},
					svgs: {
						target: 'tmp/test_svgs2/svgs/',
						colors: {
							red: '#F00',
							blue: '#00F'
						}
					}
				}
			},
			test_svgs3: {
				options: {
					source: 'test/src',
					iconName: function(fileName) {
						return fileName.replace(/^icon-(.*)\.svg$/, '$1');
					},
					outputPath: function(filePath, iconName, colorName) {
						return colorName + '__' + iconName + '.svg';
					},
					svgs: {
						target: 'tmp/test_svgs3/svgs/',
						colors: {
							red: '#F00',
							blue: '#00F'
						}
					}
				}
			},
			test_dimensions: {
				options: {
					source: 'test/src/dimensions',
					json: 'tmp/test_dimensions/data.json'
				}
			},
			test_no_dimensions: {
				options: {
					source: 'test/src/no_dimensions',
					json: 'tmp/test_no_dimensions/data.json',
					scss: 'tmp/test_no_dimensions/saxicon.scss'
				}
			},
			test_auto_color_naming: {
				options: {
					source: 'test/src/multi',
					json: 'tmp/test_auto_color_naming/test.json'
				}
			},
			test_multi: {
				options: {
					source: 'test/src/multi',
					scss: 'tmp/test_multi/_saxicon.scss'
				}
			},
			test_gray: {
				options: {
					preferGray: true,
					source: 'test/src/gray',
					json: 'tmp/test_gray/test.json'
				}
			},
			test_string_keys: {
				options: {
					source: 'test/src/',
					scss: 'tmp/test_string_keys/_saxicon.scss'
				}
			},
			test_numeric_keys: {
				options: {
					iconName: function(fileName) {
						return fileName.replace(/^icon-0(\d)\.svg$/, '$1');
					},
					source: 'test/src/',
					scss: 'tmp/test_numeric_keys/_saxicon.scss'
				}
			},
			test_map_merge1: {
				options: {
					mergeMaps: true,
					source: 'test/src',
					scss: 'tmp/test_map_merge/_saxicon1.scss'
				}
			},
			test_map_merge2: {
				options: {
					mergeMaps: true,
					source: 'test/src',
					scss: 'tmp/test_map_merge/_saxicon2.scss'
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
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	// Whenever the 'test' task is run, first clean the 'tmp' dir, then run this
	// plugin's task(s), then test the result.
	grunt.registerTask('test', ['clean', 'nodeunit']);

	// By default, lint and run all tests.
	grunt.registerTask('default', ['clean', 'test']);
};
