export const rules = {

	// ESLint rule for putting newlines between function argument definitions
	'function-args-newline': {
		meta: {
			type: 'layout',
			fixable: 'whitespace',
			docs: {
				description: 'Require each function definition parameter on its '
					+ 'own line if more than one parameter exists.'
			},
			messages: { paramMultiline: 'Parameter `{{name}}` should be on its own line (one-param-per-line style).' }
		},
		create(context) {

			const sourceCode = context.getSourceCode();
			function checkParams(params) {

				if (params.length < 2)
					return;

				// Get line numbers
				const lines = params.map((p) => sourceCode.getFirstToken(p).loc.start.line);

				// Detect duplicates: two params starting same line
				for (let i = 1; i < lines.length; i++) {

					if (lines[i] === lines[i - 1]) {

						context.report({
							node: params[i],
							messageId: 'paramMultiline',
							data: {
								name: sourceCode
									.getText(params[i])
									.split(':')[0]
							},
							fix(fixer) {

								const prev = params[i - 1];
								const commaToken = sourceCode.getTokenAfter(prev);
								if (!commaToken)
									return null;
								return fixer.replaceText(
									commaToken,
									commaToken.value + '\n'
								);

							}
						});

					}

				}

			}

			return {
				FunctionDeclaration: (node) => checkParams(node.params),
				FunctionExpression: (node) => checkParams(node.params),
				ArrowFunctionExpression: (node) => checkParams(node.params)
			};

		}
	},

	// ESLint rule for putting end parens on their own line if the start/end parens are not on the same line
	'condition-paren-newline': {
		meta: {
			type: 'layout',
			fixable: 'whitespace',
			docs: { description: 'Enforce closing parenthesis on a new line for multiline conditions.' },
			messages: {
				parensSingleLine: 'Move closing `)` to the line with the opening `(`, when condition is not multiline.',
				parensMultiline: 'Move closing `)` to its own line when condition is multiline.'
			}
		},
		create(context) {

			const sourceCode = context.getSourceCode();

			function checkIfStatement(node) {

				const openParen = sourceCode.getTokenBefore(
					node.test,
					(token) => token.value === '('
				);
				const closeParen = sourceCode.getTokenAfter(
					node.test,
					(token) => token.value === ')'
				);

				if (!openParen || !closeParen)
					return;

				/*
				 * Case 1: Single-line condition - put closing paren on same line as open paren
				 * Case 2: Multi-line condition - put closing paren on new line
				 */
				if (closeParen.loc.end.line - openParen.loc.start.line === 1) {

					context.report({
						node: closeParen,
						messageId: 'parensSingleLine',
						fix(fixer) {

							const tokenBeforeClose = sourceCode.getTokenBefore(closeParen);
							const range = [
								tokenBeforeClose.range[1],
								closeParen.range[0]
							];
							return fixer.replaceTextRange(
								range,
								' '
							);

						}
					});

				} else if (openParen.loc.end.line !== closeParen.loc.start.line
					&& closeParen.loc.start.line === node.test.loc.end.line
				) {

					context.report({
						node: closeParen,
						messageId: 'parensMultiline',
						fix(fixer) {

							return fixer.insertTextBefore(
								closeParen,
								'\n'
							);

						}
					});

				}

			}

			return {
				IfStatement: checkIfStatement,
				WhileStatement: checkIfStatement,
				DoWhileStatement: checkIfStatement
			};

		}
	},

	'newline-per-chained-call': {
		meta: {
			type: 'layout',
			fixable: 'whitespace',
			docs: {
				description: 'Enforce newlines for chained calls (>1), disallow them for single calls, '
					+ 'and remove redundant newlines.'
			},
			messages: {
				newline: 'This chained call should be on a new line.',
				noRedundantNewline: 'Remove redundant newline before this chained call.',
				noNewline: 'This single chained call must be on the same line as the object.'
			}
		},
		create(context) {

			const sourceCode = context.getSourceCode();

			function getChain(node) {

				const chain = [];
				let current = node;
				while (current && current.type === 'CallExpression') {

					if (current.callee.type !== 'MemberExpression') {

						break;

					}
					chain.push(current);
					current = current.callee.object;

				}
				return chain.reverse();

			}

			return {
				CallExpression(node) {

					// This guard ensures we only process the *end* of a chain once.
					if (node.parent.type === 'MemberExpression' && node.parent.object === node) {

						return;

					}

					const chain = getChain(node);
					if (chain.length < 1) { // No chain to process

						return;

					}

					const isSingleCallChain = chain.length === 1;
					const object = chain[0].callee.object;

					for (let i = 0; i < chain.length; i++) {

						const currentCall = chain[i];
						const prevNode = i === 0
							? object
							: chain[i - 1];
						const dotToken = sourceCode.getTokenAfter(
							prevNode,
							{ filter: (t) => t.value === '.' }
						);

						if (!dotToken || dotToken.range[0] >= currentCall.range[1]) {

							continue;

						}

						const dotLine = dotToken.loc.start.line;
						const prevNodeEndLine = prevNode.loc.end.line;

						if (isSingleCallChain) {

							// For single calls, everything must be on one line.
							if (dotLine !== prevNodeEndLine) {

								context.report({
									node: currentCall,
									loc: dotToken.loc,
									messageId: 'noNewline',
									fix(fixer) {

										const range = [
											prevNode.range[1],
											dotToken.range[0]
										];

										// Replace all whitespace between the previous node and the dot with nothing.
										return fixer.replaceTextRange(
											range,
											''
										);

									}
								});

							}

						} else {

							// For multiple calls, each call must start on a new line.
							if (dotLine === prevNodeEndLine) {

								context.report({
									node: currentCall,
									loc: dotToken.loc,
									messageId: 'newline',
									fix(fixer) {

										return fixer.insertTextBefore(
											dotToken,
											'\n'
										);

									}
								});

							} else if (dotLine > prevNodeEndLine + 1) {

								context.report({
									node: currentCall,
									loc: {
										start: prevNode.loc.end,
										end: dotToken.loc.start
									},
									messageId: 'noRedundantNewline',
									fix(fixer) {

										const range = [
											prevNode.range[1],
											dotToken.range[0]
										];

										// Replace whitespace between nodes with a single newline.
										return fixer.replaceTextRange(
											range,
											'\n'
										);

									}
								});

							}

						}

					}

				}
			};

		}
	}

};
