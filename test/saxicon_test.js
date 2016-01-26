'use strict';

var grunt = require('grunt'),
	exec = require('child_process').exec,
	path = require('path'),
	_ = require('lodash'),
	execOptions;

execOptions = {
	cwd: path.join(__dirname, '..')
};


exports.saxicon = {
	// Get list of test SVGs
	setUp: function(done) {
		this.svgs = grunt.file.expand({
			cwd: 'test/src'
		}, '*.svg').map(function(x) {
			return [path.basename(x, '.svg'), '.svg'];
		});

		done();
	},

	// Clean the tmp directory
	tearDown: function(done) {
		exec('grunt clean', execOptions, function() {
			done();
		});
	},

	// Test that there is a file for each icon + color combination, based on the
	// colors specified in the test_svgs task
	test_svgs: function(test) {
		var colors = _.keys(grunt.config('saxicon.test_svgs.options.svgs.colors')),
			output;

		test.expect(1 + (this.svgs.length * colors.length));

		exec('grunt saxicon:test_svgs', execOptions, function(error, stdout) {
			var svgs = grunt.file.expand({
				cwd: 'tmp/svgs'
			}, '*.svg');

			test.ok(svgs.length === this.svgs.length * colors.length);

			colors.forEach(function(color) {
				this.svgs.forEach(function(a) {
					var fname = a[0] + '.' + color + a[1];
					test.notEqual(svgs.indexOf(fname), -1);
				});
			}.bind(this));

			test.done();
		}.bind(this));
	},

	// Test that JSON output is parseable and has the expected keys
	test_json: function(test) {
		// Each item in the JSON output should contain these keys
		// and type.
		var keys = {
			width: 'number',
			height: 'number',
			components: 'object',
			path: 'string',
			icon: 'string'
		};

		test.expect(2 + (_.size(keys) + 1) * this.svgs.length);

		exec('grunt saxicon:test_json', execOptions, function(error, stdout) {
			var data;

			// Test that JSON output is parseable
			test.doesNotThrow(function() {
			 	data = grunt.file.readJSON('tmp/data.json');
			});

			// Test that the JSON contains as many items as there are
			// there are source icons
			test.equal(data.length, this.svgs.length);

			data.forEach(function(x) {
				_.mapValues(keys, function(v, k) {
					test.equal(typeof x[k], v);
				});
				test.ok(x.components.length > 0);
			}.bind(this));

			test.done();
		}.bind(this));
	}
};
