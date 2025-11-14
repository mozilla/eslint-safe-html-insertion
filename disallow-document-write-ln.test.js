// enforce-foo-bar.test.js
const { RuleTester } = require("eslint");
const docWriteRule = require("./disallow-document-write-ln.js");

const ruleTester = new RuleTester({
	// Must use at least ecmaVersion 2015 because
	// that's when `const` variables were introduced.
	languageOptions: { ecmaVersion: 2015 },
});

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
	"disallow-doc-write-ln", // rule name
	docWriteRule, // rule code
	{
		// 'valid' checks cases that should pass
		valid: [
		],
		// 'invalid' checks cases that should not pass
		invalid: [
			{
				code: "document.write('');",
				errors: 1,
			},
            {
                code: "document.writeln('');",
				errors: 1,
            },
			{
				code: "document.write(evil);",
				errors: 1,
			},
            {
				code: "document.writeln(evil);",
				errors: 1,
			},

		],
	},
);

console.log("[disallow-document-write-ln] All tests passed!");
