/*global escape:true*/

'use strict';

/*
 * grunt-saxicon 0.4.0-beta.1
 * Copyright (c) 2017 Lachlan McDonald
 * https://github.com/lachlanmcdonald/grunt-saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
var path = require('path'),
	xml2js = require('xml2js'),
	_ = require('lodash'),
	svgColorLookup,
	svgColorGrays;

module.exports = function(grunt) {
	var parseSVG, globSVGFiles;

	parseSVG = (function() {
		var colorKey = '__saxicon__',
			tags = ['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path'],
			maxDepth = 50,
			getColorKeyword,
			options,
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

		getColorKeyword = function(original) {
			var s = original.trim().replace(/^#/, '').toUpperCase();

			if (svgColorLookup.hasOwnProperty(s)) {
				return svgColorLookup[s];
			} else if (/^([A-F0-9])\1([A-F0-9])\2([A-F0-9])\3$/i.test(s)) {
				var t = s[0] + s[2] + s[4];
				if (svgColorLookup.hasOwnProperty(t)) {
					return svgColorLookup[t];
				}
			}
			return original;
		};

		traverse = function(obj, parentKey, depth) {
			parentKey = parentKey || '';
			depth = depth || 1;

			if (depth > maxDepth) {
				grunt.log.warn('Max call depth (' + maxDepth + ') reached whilst processing SVG.');
				return false;
			}

			if (typeof obj === 'object') {
				return _.mapValues(obj, function(node, key) {
					if (key === parser.options.attrkey) {
						if (tags.indexOf(parentKey) > -1) {
							if (node.fill !== 'none') {
								if (typeof node.fill !== 'string') {
									node.fill = options.defaultColor;
								} else if (options.autoColorNaming === true) {
									node.fill = getColorKeyword(node.fill);
								}

								node.fill = (colorKey + node.fill + colorKey);
							}
							if (node.hasOwnProperty('stroke') && node.stroke !== 'none') {
								if (options.autoColorNaming === true) {
									node.stroke = getColorKeyword(node.stroke);
								}

								node.stroke = (colorKey + node.stroke + colorKey);
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

		return function(filePath, _options) {
			var content = grunt.file.read(filePath),
				width = null,
				height = null,
				parsed;

			options = _options;

			parser.parseString(content, function(error, xml) {
				grunt.log.debug('Parsing: ' + filePath);
				xml = traverse(xml);

				var attributeWidth = parseFloat(xml.svg[parser.options.attrkey].width),
					attributeHeight = parseFloat(xml.svg[parser.options.attrkey].height),
					viewBox = (xml.svg[parser.options.attrkey].viewBox || '').split(/[ ,] */);

				if (isNaN(attributeWidth) || isNaN(attributeHeight)) {
					if (viewBox.length === 4) {
						var viewBoxWidth = parseFloat(viewBox[2]),
							viewBoxHeight = parseFloat(viewBox[3]);

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
			defaultColor: 'black',
			autoColorNaming: true,
			mergeMaps: false,
			preferGray: false,
			iconName: function(fileName) {
				return fileName.replace(/^(.*)\.svg$/, '$1');
			},
			outputPath: function(filePath, iconName, colorName) {
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
		if (_.isString(options.defaultColor) === false) {
			grunt.fail.warn('"defaultColor" must be a string.');
		}
		if (_.isBoolean(options.autoColorNaming) === false) {
			grunt.fail.warn('"autoColorNaming" must be a boolean.');
		}
		if (_.isBoolean(options.preferGray) === false) {
			grunt.fail.warn('"preferGray" must be a boolean.');
		}
		if (_.isBoolean(options.mergeMaps) === false) {
			grunt.fail.warn('"mergeMaps" must be a boolean.');
		}

		if (options.preferGray === true) {
			grunt.verbose.oklns('Being pendantic about gray');
			_.extend(svgColorLookup, svgColorGrays);
		}

		svgFiles = globSVGFiles(options.source, options.iconName);

		if (_.size(svgFiles) === 0) {
			grunt.fail.warn('"source" directory did not contain any SVG files.');
		}

		grunt.verbose.oklns('Found ' + _.size(svgFiles) + ' SVG file(s).');

		svgFiles = _.mapValues(svgFiles, function(filePath, iconName) {
			var data = parseSVG(filePath, options);
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
					var a = (x[x.length - 1] === '\'' || x[x.length - 1] === '"'),
						b = (x[0] === '\'' || x[0] === '"');

					return (a || b) ? '"' + x.replace(/[^\ \-\.\d\w]/g, escape).replace(/"/g, '\'') + '"' : x;
				}).join(', ');

				map.push('"' + set.icon + '": (' + set.width + ', ' + set.height + ', (' + set.svg + '))');
			});

			var values = _.values(map).join(',\n');

			if (options.mergeMaps === true) {
				var mapVariable = '$saxicon-map-' + (+new Date());

				map = [
					mapVariable + ': (' + values + ');\n',
					'@if (variable_exists(saxicon-map)) {',
					'	$saxicon-map: map_merge($saxicon-map, ' + mapVariable + ') !global;',
					'} @else {',
					'	$saxicon-map: ' + mapVariable + ' !global;',
					'}'
				].join('\n');
			} else {
				map = '$saxicon-map: (' + values + ');';
			}

			grunt.file.write(options.scss, map + '\n\n' + scssUtils);
		}
	});
};

svgColorLookup = {
	'000': 'black',
	'000080': 'navy',
	'00008B': 'darkblue',
	'0000CD': 'mediumblue',
	'00F': 'blue',
	'006400': 'darkgreen',
	'008000': 'green',
	'008080': 'teal',
	'008B8B': 'darkcyan',
	'00BFFF': 'deepskyblue',
	'00CED1': 'darkturquoise',
	'00FA9A': 'mediumspringgreen',
	'0F0': 'lime',
	'00FF7F': 'springgreen',
	'0FF': 'cyan',
	'191970': 'midnightblue',
	'1E90FF': 'dodgerblue',
	'20B2AA': 'lightseagreen',
	'228B22': 'forestgreen',
	'2E8B57': 'seagreen',
	'2F4F4F': 'darkslategrey',
	'32CD32': 'limegreen',
	'3CB371': 'mediumseagreen',
	'40E0D0': 'turquoise',
	'4169E1': 'royalblue',
	'4682B4': 'steelblue',
	'483D8B': 'darkslateblue',
	'48D1CC': 'mediumturquoise',
	'4B0082': 'indigo',
	'556B2F': 'darkolivegreen',
	'5F9EA0': 'cadetblue',
	'6495ED': 'cornflowerblue',
	'66CDAA': 'mediumaquamarine',
	'696969': 'dimgrey',
	'6A5ACD': 'slateblue',
	'6B8E23': 'olivedrab',
	'708090': 'slategrey',
	'789': 'lightslategrey',
	'7B68EE': 'mediumslateblue',
	'7CFC00': 'lawngreen',
	'7FFF00': 'chartreuse',
	'7FFFD4': 'aquamarine',
	'800000': 'maroon',
	'800080': 'purple',
	'808000': 'olive',
	'808080': 'grey',
	'87CEEB': 'skyblue',
	'87CEFA': 'lightskyblue',
	'8A2BE2': 'blueviolet',
	'8B0000': 'darkred',
	'8B008B': 'darkmagenta',
	'8B4513': 'saddlebrown',
	'8FBC8F': 'darkseagreen',
	'90EE90': 'lightgreen',
	'9370DB': 'mediumpurple',
	'9400D3': 'darkviolet',
	'98FB98': 'palegreen',
	'9932CC': 'darkorchid',
	'9ACD32': 'yellowgreen',
	'A0522D': 'sienna',
	'A52A2A': 'brown',
	'A9A9A9': 'darkgrey',
	'ADD8E6': 'lightblue',
	'ADFF2F': 'greenyellow',
	'AFEEEE': 'paleturquoise',
	'B0C4DE': 'lightsteelblue',
	'B0E0E6': 'powderblue',
	'B22222': 'firebrick',
	'B8860B': 'darkgoldenrod',
	'BA55D3': 'mediumorchid',
	'BC8F8F': 'rosybrown',
	'BDB76B': 'darkkhaki',
	'C0C0C0': 'silver',
	'C71585': 'mediumvioletred',
	'CD5C5C': 'indianred',
	'CD853F': 'peru',
	'D2691E': 'chocolate',
	'D2B48C': 'tan',
	'D3D3D3': 'lightgrey',
	'D8BFD8': 'thistle',
	'DA70D6': 'orchid',
	'DAA520': 'goldenrod',
	'DB7093': 'palevioletred',
	'DC143C': 'crimson',
	'DCDCDC': 'gainsboro',
	'DDA0DD': 'plum',
	'DEB887': 'burlywood',
	'E0FFFF': 'lightcyan',
	'E6E6FA': 'lavender',
	'E9967A': 'darksalmon',
	'EE82EE': 'violet',
	'EEE8AA': 'palegoldenrod',
	'F08080': 'lightcoral',
	'F0E68C': 'khaki',
	'F0F8FF': 'aliceblue',
	'F0FFF0': 'honeydew',
	'F0FFFF': 'azure',
	'F4A460': 'sandybrown',
	'F5DEB3': 'wheat',
	'F5F5DC': 'beige',
	'F5F5F5': 'whitesmoke',
	'F5FFFA': 'mintcream',
	'F8F8FF': 'ghostwhite',
	'FA8072': 'salmon',
	'FAEBD7': 'antiquewhite',
	'FAF0E6': 'linen',
	'FAFAD2': 'lightgoldenrodyellow',
	'FDF5E6': 'oldlace',
	'F00': 'red',
	'F0F': 'magenta',
	'FF1493': 'deeppink',
	'FF4500': 'orangered',
	'FF6347': 'tomato',
	'FF69B4': 'hotpink',
	'FF7F50': 'coral',
	'FF8C00': 'darkorange',
	'FFA07A': 'lightsalmon',
	'FFA500': 'orange',
	'FFB6C1': 'lightpink',
	'FFC0CB': 'pink',
	'FFD700': 'gold',
	'FFDAB9': 'peachpuff',
	'FFDEAD': 'navajowhite',
	'FFE4B5': 'moccasin',
	'FFE4C4': 'bisque',
	'FFE4E1': 'mistyrose',
	'FFEBCD': 'blanchedalmond',
	'FFEFD5': 'papayawhip',
	'FFF0F5': 'lavenderblush',
	'FFF5EE': 'seashell',
	'FFF8DC': 'cornsilk',
	'FFFACD': 'lemonchiffon',
	'FFFAF0': 'floralwhite',
	'FFFAFA': 'snow',
	'FF0': 'yellow',
	'FFFFE0': 'lightyellow',
	'FFFFF0': 'ivory',
	'FFF': 'white'
};

svgColorGrays = {
	'2F4F4F': 'darkslategray',
	'696969': 'dimgray',
	'708090': 'slategray',
	'778899': 'lightslategray',
	'808080': 'gray',
	'A9A9A9': 'darkgray',
	'D3D3D3': 'lightgray'
};
