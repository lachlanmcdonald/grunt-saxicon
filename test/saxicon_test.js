'use strict';

var grunt = require('grunt'),
	exec = require('child_process').exec,
	path = require('path'),
	srcCount = 8,
	execOptions;

execOptions = {
	cwd: path.join(__dirname, '..')
};

exports.saxicon = {
	setUp: function(done) {
		done();
	},
	tearDown: function(done) {
		done();
	},
	test_json_valid: function(test) {
		test.expect(1);

		exec('grunt saxicon:test_json', execOptions, function(error, stdout) {
			test.doesNotThrow(function() {
				grunt.file.readJSON('tmp/data.json');
			});

			test.done();
		});
	},
	test_json_structure: function(test) {
		test.expect(1 + 6 * srcCount);

		exec('grunt saxicon:test_json', execOptions, function(error, stdout) {
			var data = grunt.file.readJSON('tmp/data.json');
			test.equal(data.length, 8);

			data.forEach(function(x) {
				test.equal(typeof x.width, "number");
				test.equal(typeof x.height, "number");
				test.equal(typeof x.components, "object");
				test.equal(typeof x.path, "string");
				test.equal(typeof x.icon, "string");
				test.ok(x.components.length > 0);
			});

			test.done();
		});
	}
};
