
module.exports = {
	meta: {
		type: "problem",
		docs: {
			description:
				"Warn against usage of `innerHTML`, `outerHTML`, etc. and use the safe `setHTML` instead.",
		},
		fixable: "code",
		schema: [],
	},
	create(context) {
		function isDisallowedProperty(property) {
			if (property.type === "Identifier") {
				if ((['innerHTML', 'outerHTML']).includes(property.name)) {
					return true
				}
			}
		};
		function isUnsafeInsertAdjacentHTMLFn(callee) {
		if (callee.type === "MemberExpression" && callee.property.type === "Identifier" && callee.property.name === "insertAdjacentHTML") {
				return true;
			}
		};
		return {
            AssignmentExpression(node) {
				let debug = context.sourceCode.getText(node);
                if (node.left.type === "MemberExpression") {
					const memberExpr = node.left;
                    if (isDisallowedProperty(memberExpr.property) && (node.right.type !== "Literal")) {
                            context.report({
                                node,
                                message: 'Unsafe use of `{{ property.name }}`. Use `setHTML` instead.',
                                fix(fixer) {
									let source = context.sourceCode.getText(node);
                                    // TODO: Replace with a proper node object instead of this ugly source code regex replace.
                                    let propName = node.left.property.name;
									if (propName === "innerHTML") {
                                        let regexp = new RegExp(`\\b([A-Za-z_$][\\w$]*)\\.${propName}\\s*=\\s*([^;]+);?`, "g");
                                        return fixer.replaceText(node, source.replace(regexp, '$1.setHTML($2)')
                                        );
                                    } else if (propName === "outerHTML") {
                                       let regexp = new RegExp(`\\b([A-Za-z_$][\\w$]*)\\.${propName}\\s*=\\s*([^;]+);?`, "g");
                                       let code = `const temp = document.createElement('template');\ntemp.setHTML($2);\n$1.replaceWith(...temp.content.childNodes)`
                                       return fixer.replaceText(node, source.replace(regexp, code));
                                    } else {
										throw new Error("Unexpected assignment property.");
									}
                                }
                            });
					}
				}
			},
			CallExpression(node) {
				let debug = context.sourceCode.getText(node);
				if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
					if (isUnsafeInsertAdjacentHTMLFn(node.callee)) {
                        if (node.arguments.length < 2) {
							return;
						}
						let replacer;
						let canFix = false;
						// TODO: This could be a config-value that we check.
						// We are allowing calls where the supplied HTML string is a hard-coded string literal.
						if (node.arguments[1].type === "Literal") {
							return;
						}
						// are we supplying 'afterend', 'beforebegin' etc?
                        if (node.arguments[0].type === "Literal") {
							let position;
							/// The name of the parameter html name going into insertAdjacentHTML():
							let htmlVarName = node.arguments[1].name;
							/// The name of the element on which insertAdjacentHTML() is being called.
							let ctxElemVarName = node.callee.object.name;

							switch(node.arguments[0].value) {
								// TODO:
								// Once we get appendHTML, prependHTML etc, we should use them instead
								// https://github.com/whatwg/html/issues/11669
								case "afterbegin":
									position = "prepend";
									canFix = true;
									break;
								case "afterend":
									position = "after"
									canFix = true;
									break;
								case "beforebegin":
									position = "before";
									canFix = true;
									break;
								case "beforeend":
									position = "append";
									canFix = true;
									break;
							    default:
									canFix = false;
							}
							if (canFix && position) {
								replacer = `const temp = document.createElement('template');\ntemp.setHTML(${htmlVarName});\n${ctxElemVarName}.${position}(...temp.content.childNodes)`;
							}
						}
						if (!canFix) {
							context.report({
                                node,
                                message: 'Unsafe use of {{ fnName }}. Use `setHTML` instead.',
                                data: {
                                    fnName: node.callee.property.name
                                },
                            });
						}
						else {
							context.report({
                                node,
                                message: 'Unsafe use of {{ fnName }}. Use `setHTML` instead.',
                                data: {
                                    fnName: node.callee.property.name
                                },
   								fix(fixer) {
                                    return fixer.replaceText(node, replacer);
                                }
                            });
						}
					}

				}
			}
		}
	}
};