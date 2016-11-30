/*global escape:true*/
/*
 * grunt-saxicon
 * Copyright (c) 2016 Deloitte Digital
 * Licensed under the BSD 3-Clause license.
 */
var path = require('path'),
	xml2js = require('xml2js'),
	_ = require('lodash');

module.exports = function(grunt) {
	'use strict';

	var parseSVG, globSVGFiles;

	parseSVG = (function() {
		var colorKey = '__saxicon__',
			tags = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'],
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
			if (typeof obj === 'object') {
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
					} else if (_.isPlainObject(node)) {
						return traverse(node, key, depth + 1);
					}
					return node;
				});
			} else {
				return obj;
			}
		};

		return function(filePath) {
			var content = grunt.file.read(filePath),
				width = null,
				height = null,
				parsed;

			parser.parseString(content, function(error, xml) {
				grunt.log.debug('Parsing: ' + filePath);
				xml = traverse(xml);

				var attributeWidth = parseInt(xml.svg[parser.options.attrkey].width, 10),
					attributeHeight = parseInt(xml.svg[parser.options.attrkey].height, 10),
					viewBox = (xml.svg[parser.options.attrkey].viewBox || '').split(/[ ,] */);

				if (isNaN(attributeWidth) || isNaN(attributeHeight)) {
					if (viewBox.length === 4) {
						var viewBoxWidth = parseInt(viewBox[2], 10),
							viewBoxHeight = parseInt(viewBox[3], 10);

						if (isNaN(viewBoxWidth) === false && isNaN(viewBoxHeight) === false) {
							width = viewBoxWidth;
							height = viewBoxHeight;
							grunt.log.debug('Using viewBox dimensions:', width, height);
						}
					}
				} else {
					width = attributeWidth;
					height = attributeHeight;
					grunt.log.debug('Using attribute dimensions:', width, height);
				}

				parsed = builder.buildObject(xml);
			});

			return {
				width: width,
				height: height,
				components: parsed.split(colorKey)
			};
		};
	})();

	globSVGFiles = function(dirPath, callback) {
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
		var dataSets = [],
			svgFiles,
			options;

		options = this.options({
			iconName: function(fileName) {
				return fileName.replace(/^(.*)\.svg$/, '$1');
			},
			outputPath: function(filePath, iconName, colorName, color) {
				return iconName + '.' + colorName + '.svg';
			}
		});

		if (_.isFunction(options.iconName) === false) {
			grunt.fail.warn('"iconName" is not a function.');
		}
		if (_.isFunction(options.outputPath) === false) {
			grunt.fail.warn('"fileName" is not a function.');
		}
		if (_.isString(options.source) === false) {
			grunt.fail.warn('"source" is a required and must be a string.');
		}

		svgFiles = globSVGFiles(options.source, options.iconName);

		if (_.size(svgFiles) === 0) {
			grunt.fail.warn('"source" directory did not contain any SVG files.');
		}

		grunt.verbose.oklns('Found ' + _.size(svgFiles) + ' file(s).');

		svgFiles = _.mapValues(svgFiles, function(filePath, iconName) {
			var data = parseSVG(filePath);
			if (data !== false) {
				data.path = filePath;
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

			_.forEach(options.svgs.colors, function(color, name) {
				if (/^[a-z\.\_\- 0-9\@]+$/i.test(name) === false) {
					grunt.fail.warn('Color name contains invalid characters: ' + name);
				}
				if (/^#([a-f0-9]{3}){1,2}$/i.test(color) === false) {
					grunt.fail.warn('Color is not a valid hex color: ' + color);
				}
			});

			dataSets.forEach(function(set) {
				_.forEach(options.svgs.colors, function(color, name) {
					var outputPath = options.outputPath(set.path, set.icon, name, color),
						content = set.components.join(color);
					outputPath = path.join(options.svgs.target, outputPath);
					grunt.file.write(outputPath, content);
				});
			});
		}

		if (_.has(options, 'scss')) {
			grunt.verbose.oklns('Writig SCSS: ' + options.scss);
			var scssUtils = grunt.file.read(path.join(__dirname, 'saxicon.scss')),
				map = [];

			dataSets.forEach(function(set) {
				set.svg = set.components.map(function(x) {
					return '"' + x.replace(/[^\ \-\.\d\w]/g, escape).replace(/"/g, '\'') + '"';
				}).join(', ');

				map.push(set.icon + ': (' + set.width + ', ' + set.height + ', (' + set.svg + '))');
			});

			map = '$saxicon-map: (' + _.values(map).join(',\n') + ');\n';
			grunt.file.write(options.scss, map + '\n' + scssUtils);
		}
	});
};
