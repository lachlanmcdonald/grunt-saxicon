/*
 * grunt-saxicon 0.4.0-beta.1
 * Copyright (c) 2018 Lachlan McDonald
 * https://github.com/lachlanmcdonald/grunt-saxicon/
 *
 * Licensed under the BSD 3-Clause license.
 */
'use strict';

const path = require('path');
const exec = require('child_process').exec;
const execOptions = {
	cwd: path.join(__dirname, '..')
};

exports.tests = {
	smoketest: (test) => {
		test.expect(1);

		exec('grunt saxicon:test', execOptions, (error) => {
			test.ifError(error);
			test.done();
		});
	}
};
