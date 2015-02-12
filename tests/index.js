var assert = require('assert');
var fs = require('fs');
var stylecow = require('stylecow');

var reader = stylecow.Reader.readFile(__dirname + '/case.css');
var css = stylecow.Root.create(reader);
var expected = fs.readFileSync(__dirname + '/expected.css', 'utf8');

stylecow.loadNpmModule(__dirname + '/../index');
stylecow.run(css);

console.log(css.toString());
//assert.equal(css.toString(), expected);