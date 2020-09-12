# stylecow plugin nested-rules

Stylecow plugin to add support for nested rules.

More info:

* https://drublic.de/blog/the-css-hierarchies-module-level-3/
* http://lists.w3.org/Archives/Public/www-style/2011Jun/0022.html


You write:

```css
body {
	& p {
		color: blue;
	}
	& > section {
		& h1,
    & h2 {
			color: red;

			&.green {
				color: green;
			}
		}
	}
	& div,
  & span {
		& a {
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
body > section h1,
body > section h2 {
	color: red;
}
body > section h1 .green,
body > section h2.green {
	color: green;
}
body div a,
body span a {
	color: orange;
}
```
