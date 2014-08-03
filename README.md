stylecow plugin nested-rules
============================

Stylecow plugin to add support for nested rules.
Use the plugin "matches" to convert the result in old-style css code.

You write:

```css
body {
	p {
		color: blue;
	}
	> section {
		h1, h2 {
			color: red;

			&.green {
				color: green;
			}
		}
	}
	div, span {
		a {
			color: orange;
		}
	}
}
```

And stylecow converts to:

```css
body p {
	color: blue;
}
body>section :matches(h1, h2) {
	color: red;
}
body>section :matches(h1, h2).green {
	color: green;
}
body :matches(div, span) a {
	color: orange;
}
```
