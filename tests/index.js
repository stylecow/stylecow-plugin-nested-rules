var assert = require('assert');
var fs = require('fs');
var stylecow = require('stylecow');

stylecow.loadNpmModule(__dirname + '/../index');

[1, 2].forEach(function (num) {
	var code = stylecow.Reader.readFile(__dirname + '/cases/' + num + '.css');
	var css = stylecow.Root.create(code);
	var expected = fs.readFileSync(__dirname + '/expected/' + num + '.css', 'utf8');

	stylecow.run(css);

	assert.equal(css.toString(), expected);
});
