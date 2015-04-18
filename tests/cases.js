var stylecow = require('stylecow');

stylecow
	.loadNpmModule(__dirname + '/../index')
	.minSupport({
		"explorer": 0,
		"firefox": 0,
		"chrome": 0,
		"safari": 0,
		"opera": 0,
		"android": 0,
		"ios": 0
	})
	.testCases(__dirname + '/cases', function (name, css, assert) {
		stylecow.run(css);

		describe('cases/' + name, function() {
			it('should match output.css and ast.json', function() {
				assert();
			});
		});

		//assert.regenerate();
	});
