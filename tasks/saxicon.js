/*
 * grunt-saxicon
 * Copyright (c) 2016 Lachlan McDonald
 * Licensed under the BSD 3-Clause license.
 */
var path = require('path'),
	_ = require('lodash');

module.exports = function(grunt) {
	'use strict';

	var globSVGFiles = function(path, callback) {
		var temp = {};
		grunt.file.expand({
			cwd: path
		}, '*.svg').forEach(function(fileName) {
			var iconName = callback(fileName);
			temp[iconName] = path.join(path, fileName);
		});
		return temp;
	};

	grunt.registerMultiTask('saxicon', function() {
		var taskAsync = this.async(),
			svgFiles,
			options;

		options = this.options({
			iconName: function(fileName) {
				return fileName.replace(/^(.*)\.svg$/, '$1');
			},
			svgs: {
				fileName: function(fileName, iconName, colorName, color) {
        			return iconName + '.' + colorName + '.svg';
    			}
    		}
		});

		if (_.isFunction(options.iconName) === false) {
			grunt.fail.warn('"iconName" is not a function.');
		}
		if (_.isFunction(options.svgs.fileName) === false) {
			grunt.fail.warn('"fileName" is not a function.');
		}
		if (_.isString(options.source) === false) {
			grunt.fail.warn('"source" is a required and must be a string.');
		}

		svgFiles = globSVGFiles(options.source, options.iconName);

		console.log(options);
	});
};
