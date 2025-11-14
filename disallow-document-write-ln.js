
module.exports = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow usage of `document.write` and `document.writeln`",
		},
		fixable: "code",
		schema: [],
	},
	create(context) {
		function isUnsafeDocumentWriteFn(callee) {
		if (callee.type === "MemberExpression" && callee.property.type === "Identifier" && callee.object.type === "Identifier" && callee.object.name === "document" && (callee.property.name === "write" || callee.property.name === "writeln")) {
			return true;
			}
		}
		return {
			CallExpression(node) {
				if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
					if (isUnsafeDocumentWriteFn(node.callee)) {
 						context.report({
                                node,
                                message: 'Unsafe use of {{ fnName }}. Use `setHTML` instead.',
                                data: {
                                    fnName: node.callee.property.name
                                },
                            });
					}
				}
			}
		}
	}
};