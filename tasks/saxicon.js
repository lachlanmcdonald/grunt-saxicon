/*global escape:true*/
/*
 * grunt-saxicon
 * Copyright (c) 2016 Lachlan McDonald
 * Licensed under the BSD 3-Clause license.
 */
var path = require('path'),
	xml2js = require('xml2js'),
	handlebars = require('handlebars'),
	_ = require('lodash');

module.exports = function(grunt) {
	'use strict';

	var parseSVG = (function() {
		var prefix = 'data:image/svg+xml,',
			colorKey = '__saxicon__',
			tags = ['path'],
			maxDepth = 50,
			traverse,
			parser,
			builder;

		parser = new xml2js.Parser({
			explicitArray: true
		});

		builder = new xml2js.Builder({
			explicitArray: true,
			headless: true,
			renderOpts: {
				pretty: false
			}
		});

		traverse = function(obj, parentKey, depth) {
			parentKey = parentKey || '';
			depth = depth || 1;

			if (depth > maxDepth) {
				grunt.log.warn('Max call depth reached whilst processing SVG.');
				return false;
			}
			return _.mapValues(obj, function(node, key) {
				if (key === parser.options.attrkey) {
					if (tags.indexOf(parentKey) > -1) {
						if (node.fill !== 'none') {
							node.fill = colorKey;
						}
						if (node.hasOwnProperty('stroke') && node.stroke !== 'none') {
							node.stroke = colorKey;
						}
					}
				} else if (_.isArray(node)) {
					node = node.map(function(x) {
						return traverse(x, key, depth + 1);
					});
				} else {
					return traverse(node, key, depth + 1);
				}
				return node;
			});
		};

		return function(filePath) {
			var content = grunt.file.read(filePath),
				parsed,
				viewBox,
				width,
				height;

			parser.parseString(content, function(error, xml) {
				xml = traverse(xml);
				viewBox = xml.svg[parser.options.attrkey].viewBox.split(' ');
				width = parseInt(viewBox[2], 10);
				height = parseInt(viewBox[3], 10);
				parsed = builder.buildObject(xml).replace(/"/g, '\'');
			});

			parsed = (prefix + parsed.replace(/[^\ \-\.\d\w]/g, escape)).split(colorKey);

			return {
				width: width,
				height: height,
				components: parsed
			};
		};
	})();

	var globSVGFiles = function(dirPath, callback) {
		var temp = {};
		grunt.file.expand({
			cwd: dirPath
		}, '*.svg').forEach(function(fileName) {
			var iconName = callback(fileName);
			temp[iconName] = path.join(dirPath, fileName);
		});
		return temp;
	};

	grunt.registerMultiTask('saxicon', function() {
		var taskAsync = this.async(),
			dataSets = [],
			svgFiles,
			options;

		options = this.options({
			iconName: function(fileName) {
				return fileName.replace(/^(.*)\.svg$/, '$1');
			},
			fileName: function(fileName, iconName, colorName, color) {
				return iconName + '.' + colorName + '.svg';
			}
		});

		if (_.isFunction(options.iconName) === false) {
			grunt.fail.warn('"iconName" is not a function.');
		}
		if (_.isFunction(options.fileName) === false) {
			grunt.fail.warn('"fileName" is not a function.');
		}
		if (_.isString(options.source) === false) {
			grunt.fail.warn('"source" is a required and must be a string.');
		}

		svgFiles = globSVGFiles(options.source, options.iconName);

		if (svgFiles.length === 0) {
			grunt.fail.warn('"source" did not contain any SVG files.');
		}

		grunt.verbose.oklns('Found ' + _.size(svgFiles) + ' file(s).');

		svgFiles = _.mapValues(svgFiles, function(filePath, iconName) {
			var data = parseSVG(filePath);
			if (data !== false) {
				data.icon = iconName;
				dataSets.push(data);
			}
		});

		if (_.isString(options.json)) {
			grunt.verbose.oklns('Dumping intermediate data as JSON file: ' + options.json);
			grunt.file.write(options.json, JSON.stringify(dataSets, null, '    '));
		}

		if (_.has(options, 'svgs.target')) {
			if (_.isPlainObject(options.svgs.colors) === false) {
				grunt.fail.warn('"colors" is a required and must be an object.');
			}
			if (_.isString(options.svgs.target) === false) {
				grunt.fail.warn('"target" is a required and must be a string.');
			}
		}

		if (_.has(options, 'scss.output')) {
			grunt.verbose.oklns('Writig SCSS: ' + options.scss.output);
			var template = handlebars.compile('{{{icon}}}: ({{{width}}}, {{{height}}}, ({{{svg}}}))'),
				scssUtils = grunt.file.read(path.join(__dirname, 'saxicon.scss')),
				map = [];

			dataSets.forEach(function(set) {
				set.svg = set.components.map(function(x) {
					return '"' + x + '"';
				}).join(', ');

				map.push(template(set));
			});

			map = '$saxicon-map: (' + _.values(map).join(',\n') + ');\n';
			grunt.file.write(options.scss.output, map + '\n' + scssUtils);
		}
	});
};
