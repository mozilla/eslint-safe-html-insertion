// enforce-foo-bar.test.js
const { RuleTester } = require("eslint");
const fooBarRule = require("./prefer-sethtml-over-innerhtml");

const ruleTester = new RuleTester({
	// Must use at least ecmaVersion 2015 because
	// that's when `const` variables were introduced.
	languageOptions: { ecmaVersion: 2015 },
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
	"safe-html", // rule name
	fooBarRule, // rule code
	{
		// 'valid' checks cases that should pass
		valid: [
			{
				code: "foo.setHTML(bar);",
			},
            {
                code: "foo.innerHTML = 'literals are safe';"
            },
            {
                code: "foo.outerHTML = 'literals are safe2';"
            }
            {
                code: "foo.insertAdjacentHTML('beforebegin', 'literals are safe');"
            },

		],
		// 'invalid' checks cases that should not pass
		invalid: [
			{
				code: "c.innerHTML = evil;",
				output: 'c.setHTML(evil);',
				errors: 1,
			},
            {
                code: "c.outerHTML = evil;",
                output: "const temp = document.createElement('template');\ntemp.setHTML(${htmlVarName});\n$c.replaceWith(...temp.content.childNodes);",
                errors: 1
            },
           {
				code: "c.insertAdjacentHTML('beforebegin', evil)",
                output: "const temp = document.createElement('template');\ntemp.setHTML(evil);\nc.before(...temp.content.childNodes)",
				errors: 1,
			},
           {
				code: "c.insertAdjacentHTML('afterbegin', evil)",
                output: "const temp = document.createElement('template');\ntemp.setHTML(evil);\nc.prepend(...temp.content.childNodes)",
				errors: 1,
			},
           {
				code: "c.insertAdjacentHTML('beforeend', evil)",
                output: "const temp = document.createElement('template');\ntemp.setHTML(evil);\nc.append(...temp.content.childNodes)",
				errors: 1,
			},
           {
				code: "c.insertAdjacentHTML('afterend', evil)",
                output: "const temp = document.createElement('template');\ntemp.setHTML(evil);\nc.after(...temp.content.childNodes)",
				errors: 1,
			},
            {
				code: "document.write(something);",
				errors: 1,
			},
            {
				code: "document.writeln(something);",
				errors: 1,
			},

		],
	},
);

console.log("All tests passed!");
