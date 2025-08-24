import { includeIgnoreFile } from '@eslint/compat';
import eslintPluginStylistic from '@stylistic/eslint-plugin';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import eslintPluginMarkdown from 'eslint-plugin-markdown';
import { globalIgnores } from 'eslint/config';
import eslintTs from 'typescript-eslint';
import * as eslintCustom from './scripts/eslintCustom';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginImport from 'eslint-plugin-import-x';
import eslintAstroParser from 'astro-eslint-parser';
import path from 'node:path';

export default eslintTs.config([
	includeIgnoreFile(path.join(process.cwd(), '.gitignore')),
	globalIgnores(['.husky/', 'eslint.config.ts', 'commitlint.config.ts']),
	{ // eslint-config
		name: 'eslint-config',
		files: ['**/*.{ts,js,tsx,jsx}'],
		rules: {
			'no-undef': 'off'
		}
	},
	{ // eslint-ts
		name: 'eslintTs',
		files: ['**/*.{ts,tsx}'],
		extends: [eslintTs.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'@typescript-eslint/array-type': ['error', {
				default: 'array',
				readonly: 'array'
			}],
			'@typescript-eslint/class-literal-property-style': ['error', 'fields'],
			'@typescript-eslint/consistent-indexed-object-style': ['error', 'record'],
			'@typescript-eslint/consistent-type-exports': 'error',
			'@typescript-eslint/consistent-type-imports': 'off', // Prefer import/ rule over this
			'@typescript-eslint/consistent-type-assertions': ['error', {
				assertionStyle: 'as',
				arrayLiteralTypeAssertions: 'allow',
				objectLiteralTypeAssertions: 'allow'
			}],
			'dot-notation': 'off',
			'@typescript-eslint/dot-notation': ['error', {
				allowPrivateClassPropertyAccess: false,
				allowProtectedClassPropertyAccess: false,
				allowIndexSignaturePropertyAccess: false
			}],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'max-params': 'off',
			'@typescript-eslint/max-params': ['warn', {
				max: 3,
				countVoidThis: false
			}],
			'@typescript-eslint/member-ordering': ['error', {
				default: {
					memberTypes: [
						// Index signature
						'signature',
						'call-signature',

						// Fields
						'public-static-field',
						'protected-static-field',
						'private-static-field',
						'#private-static-field',

						'public-decorated-field',
						'protected-decorated-field',
						'private-decorated-field',

						'public-instance-field',
						'protected-instance-field',
						'private-instance-field',
						'#private-instance-field',

						'public-abstract-field',
						'protected-abstract-field',

						'public-field',
						'protected-field',
						'private-field',
						'#private-field',

						'static-field',
						'instance-field',
						'abstract-field',

						'decorated-field',

						'field',

						// Static initialization
						'static-initialization',

						// Constructors
						'public-constructor',
						'protected-constructor',
						'private-constructor',

						'constructor',

						// Accessors
						'public-static-accessor',
						'protected-static-accessor',
						'private-static-accessor',
						'#private-static-accessor',

						'public-decorated-accessor',
						'protected-decorated-accessor',
						'private-decorated-accessor',

						'public-instance-accessor',
						'protected-instance-accessor',
						'private-instance-accessor',
						'#private-instance-accessor',

						'public-abstract-accessor',
						'protected-abstract-accessor',

						'public-accessor',
						'protected-accessor',
						'private-accessor',
						'#private-accessor',

						'static-accessor',
						'instance-accessor',
						'abstract-accessor',

						'decorated-accessor',

						'accessor',

						// Getters
						'public-static-get',
						'protected-static-get',
						'private-static-get',
						'#private-static-get',

						'public-decorated-get',
						'protected-decorated-get',
						'private-decorated-get',

						'public-instance-get',
						'protected-instance-get',
						'private-instance-get',
						'#private-instance-get',

						'public-abstract-get',
						'protected-abstract-get',

						'public-get',
						'protected-get',
						'private-get',
						'#private-get',

						'static-get',
						'instance-get',
						'abstract-get',

						'decorated-get',

						'get',

						// Setters
						'public-static-set',
						'protected-static-set',
						'private-static-set',
						'#private-static-set',

						'public-decorated-set',
						'protected-decorated-set',
						'private-decorated-set',

						'public-instance-set',
						'protected-instance-set',
						'private-instance-set',
						'#private-instance-set',

						'public-abstract-set',
						'protected-abstract-set',

						'public-set',
						'protected-set',
						'private-set',
						'#private-set',

						'static-set',
						'instance-set',
						'abstract-set',

						'decorated-set',

						'set',

						// Methods
						'public-static-method',
						'protected-static-method',
						'private-static-method',
						'#private-static-method',

						'public-decorated-method',
						'protected-decorated-method',
						'private-decorated-method',

						'public-instance-method',
						'protected-instance-method',
						'private-instance-method',
						'#private-instance-method',

						'public-abstract-method',
						'protected-abstract-method',

						'public-method',
						'protected-method',
						'private-method',
						'#private-method',

						'static-method',
						'instance-method',
						'abstract-method',

						'decorated-method',

						'method'
					]
				}
			}],
			'@typescript-eslint/method-signature-style': ['error', 'property'],
			'@typescript-eslint/naming-convention': ['error',
				{
					selector: 'default',
					format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid'
				},
				{
					selector: 'memberLike', // classicAccessor, autoAccessor, enumMember, method, parameterProperty, property
					format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid'
				},
				{
					selector: 'accessor', // classicAccessor, autoAccessor
					format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid'
				},
				{
					selector: 'method', // classMethod, objectLiteralMethod, typeMethod
					format: ['camelCase', 'PascalCase', 'snake_case'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid'
				},
				{
					selector: 'property', // classProperty, objectLiteralProperty, typeProperty
					format: ['camelCase', 'UPPER_CASE'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'forbid'
				},
				{
					selector: 'typeLike', // class, enum, interface, typeAlias, typeParameter
					format: ['PascalCase'],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'variableLike', // function, parameter, variable
					format: [],
					leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
				},
				{
					selector: 'import',
					format: ['camelCase', 'PascalCase'],
					leadingUnderscore: 'forbid',
					trailingUnderscore: 'forbid'
				},
        {
          selector: 'objectLiteralProperty',
          format: [],
          leadingUnderscore: 'allow',
					trailingUnderscore: 'allow'
        }
			],
			'no-array-constructor': 'off',
			'@typescript-eslint/no-array-constructor': 'error',
			'@typescript-eslint/no-array-delete': 'warn',
			'@typescript-eslint/no-base-to-string': 'error',
			'@typescript-eslint/no-confusing-non-null-assertion': 'error',
			'@typescript-eslint/no-confusing-void-expression': 'error',
			'@typescript-eslint/no-deprecated': 'error',
			'@typescript-eslint/no-dupe-class-members': 'error',
			'@typescript-eslint/no-duplicate-enum-values': 'error',
			'@typescript-eslint/no-duplicate-type-constituents': 'error',
			'@typescript-eslint/no-dynamic-delete': 'error',
			'@typescript-eslint/no-empty-function': 'warn',
			'@typescript-eslint/no-empty-interface': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-extra-non-null-assertion': 'error',
			'@typescript-eslint/no-extraneous-class': 'error',
			'@typescript-eslint/no-floating-promises': ['error', {
				checkThenables: false,
				ignoreIIFE: false,
				ignoreVoid: true
			}],
			'@typescript-eslint/no-for-in-array': 'error',
			'no-implied-eval': 'off',
			'@typescript-eslint/no-implied-eval': 'error',
			'@typescript-eslint/no-invalid-void-type': ['error', {
				allowInGenericTypeArguments: true,
				allowAsThisParameter: false
			}],
			'no-loop-func': 'off',
			'@typescript-eslint/no-loop-func': 'error',
			'no-magic-numbers': 'off',
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/no-meaningless-void-operator': ['error', {
				checkNever: true
			}],
			'@typescript-eslint/no-misused-new': 'error',
			'@typescript-eslint/no-misused-promises': ['error', {
				checksConditionals: true,
				checksVoidReturn: true,
				checksSpreads: true
			}],
			'@typescript-eslint/no-misused-spread': 'error',
			'@typescript-eslint/no-mixed-enums': 'error',
			'@typescript-eslint/no-namespace': ['error', {
				allowDeclarations: false,
				allowDefinitionFiles: true
			}],
			'no-shadow': 'off',
			'@typescript-eslint/no-shadow': ['error', {
				builtinGlobals: true,
				hoist: 'functions',
				ignoreOnInitialization: false,
				ignoreTypeValueShadow: true,
				ignoreFunctionTypeParameterNameValueShadow: false
			}],
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
			'@typescript-eslint/no-unnecessary-condition': 'error',
			'@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
			'@typescript-eslint/no-unnecessary-qualifier': 'error',
			'@typescript-eslint/no-unnecessary-template-expression': 'error',
			'@typescript-eslint/no-unnecessary-type-arguments': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-unnecessary-type-constraint': 'error',
			'@typescript-eslint/no-unnecessary-type-conversion': 'error',
			'@typescript-eslint/no-unnecessary-type-parameters': 'error'

		}
	},
	{ // eslint-plugin-react
		/*name: 'eslint-plugin-react',
		files: ['**|*.{jsx,mjs,cjs,tsx}'],
		extends: [eslintPluginReact.configs.flat['jsx-runtime']],
		plugins: { '@react': eslintPluginReact },
		rules: {
			'@react/jsx-closing-bracket-location': ['error', 'line-aligned'],
			'@react/jsx-closing-tag-location': ['error', 'line-aligned'],
			'@react/jsx-tag-spacing': [
				'error',
				{
					closingSlash: 'never',
					beforeSelfClosing: 'always',
					afterOpening: 'never',
					beforeClosing: 'never'
				}
			],
			'@react/jsx-child-element-spacing': 'error'
		}*/
	},
	{ // eslint-plugin-react-hooks
		name: 'eslint-plugin-react-hooks',
		files: ['**/*.{jsx,tsx}'],
		extends: [eslintPluginReactHooks.configs['recommended-latest']]
	},
	{ // eslint-plugin-astro
		name: 'eslint-plugin-astro',
		files: ['**/*.astro'],
		extends: [eslintPluginAstro.configs['flat/recommended']],
		languageOptions: {
      parser: eslintAstroParser,
      parserOptions: {
        parser: eslintTs.parser,
        extraFileExtensions: ['.astro'],
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
		rules: {
			'astro/missing-client-only-directive-value': 'error',
			'astro/no-conflict-set-directives': 'error',
			'astro/no-deprecated-astro-canonicalurl': 'error',
			'astro/no-deprecated-astro-fetchcontent': 'error',
			'astro/no-deprecated-astro-resolve': 'error',
			'astro/no-deprecated-getentrybyslug': 'error',
			'astro/no-exports-from-components': 'error',
			'astro/no-unused-define-vars-in-style': 'error',
			'astro/valid-compile': 'error',
			'astro/no-set-html-directive': 'warn',
			'astro/no-set-text-directive': 'error',
			'astro/no-unused-css-selector': 'error',
			'astro/prefer-class-list-directive': 'error',
			'astro/prefer-object-class-list': 'error',
			'astro/prefer-split-class-list': 'off',
			'astro/sort-attributes': 'off'

		}
	},
	{ // eslint-plugin-json
		name: 'eslint-plugin-json',
		files: ['**/*.{json}'],
		extends: [eslintPluginJsonc.configs['flat/recommended-with-json']]
	},
	{ // eslint-plugin-jsonc
		name: 'eslint-plugin-jsonc',
		files: ['**/*.{jsonc}'],
		extends: [eslintPluginJsonc.configs['flat/recommended-with-jsonc']]
	},
	{ // eslint-plugin-jsonc
		name: 'eslint-plugin-json5',
		files: ['**/*.{json5}'],
		extends: [eslintPluginJsonc.configs['flat/recommended-with-json5']]
	},
	{ // eslint-plugin-markdown
		name: 'eslint-plugin-markdown',
		files: ['**/*.{md}'],
		extends: [eslintPluginMarkdown.configs.recommended]
	},
	{ // eslint-plugin-stylistic
		name: 'eslint-plugin-stylistic',
    files: ['**/*.{ts,js,tsx,jsx}'],
		extends: [eslintPluginStylistic.configs.recommended],
		plugins: {
			'@stylistic': eslintPluginStylistic
		},
		rules: {
      '@stylistic/array-bracket-newline': ['error', {
        multiline: true,
        minItems: 2
      }],
      '@stylistic/array-bracket-spacing': ['error', 'always'],
      '@stylistic/array-element-newline': ['error', {
        consistent: true,
        multiline: true,
        minItems: 2
      }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/arrow-spacing': ['error', {
        before: true,
        after: true
      }],
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', {
        allowSingleLine: false
      }],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/comma-spacing': ['error', {
        before: false,
        after: true
      }],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/computed-property-spacing': ['error', 'never', {
        enforceForClassMembers: true
      }],
      '@stylistic/curly-newline': ['error', {
        multiline: true,
        minElements: 2,
        consistent: true
      }],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/function-call-argument-newline': ['error', 'always'],
      '@stylistic/function-call-spacing': ['error', 'never'],
      '@stylistic/function-paren-newline': ['error', {
        minItems: 2
      }],
      '@stylistic/generator-star-spacing': ['error', 'after'],
      '@stylistic/implicit-arrow-linebreak': ['error', 'beside'],
      '@stylistic/indent': ['error', 'tab'],
      '@stylistic/indent-binary-ops': ['error', 'tab'],
      '@stylistic/jsx-child-element-spacing': ['error'],
      '@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
      '@stylistic/jsx-closing-tag-location': ['error', 'line-aligned'],
      '@stylistic/jsx-curly-brace-presence': ['error', 'always'],
      '@stylistic/jsx-curly-newline': ['error', 'consistent'],
      '@stylistic/jsx-curly-spacing': ['error', {
        when: 'never',
        attributes: true,
        children: true
      }],
      '@stylistic/jsx-equals-spacing': ['error', 'never'],
      '@stylistic/jsx-first-prop-new-line': ['error', 'multiline'],
      '@stylistic/jsx-function-call-newline': ['error', 'multiline'],
      '@stylistic/jsx-indent': ['off'],
      '@stylistic/jsx-indent-props': ['error', 'tab'],
      '@stylistic/jsx-max-props-per-line': ['error', {
        maximum: 1
      }],
      '@stylistic/jsx-newline': ['error', {
        prevent: true,
        allowMultilines: true
      }],
      '@stylistic/jsx-one-expression-per-line': ['error', {
        allow: 'none'
      }],
      '@stylistic/jsx-pascal-case': ['off'],
      '@stylistic/jsx-props-no-multi-spaces': ['off'], // Off in favor for 'no-multi-spaces'
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/jsx-self-closing-comp': ['error', {
        component: true
      }],
      '@stylistic/jsx-sort-props': ['error', {
        ignoreCase: false,
        callbacksLast: true,
        shorthandFirst: true,
        shorthandLast: false,
        multiline: 'ignore',
        noSortAlphabetically: true,
        reservedFirst: true,
        locale: 'en'
      }],
      '@stylistic/jsx-tag-spacing': ['error', {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never'
      }],
      '@stylistic/jsx-wrap-multilines': ['error', {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens',
        logical: 'parens',
        prop: 'parens-new-line',
        propertyValue: 'parens'
      }],
      '@stylistic/key-spacing': ['error', {
        beforeColon: false,
        afterColon: true,
        mode: 'strict'
      }],
      '@stylistic/line-comment-position': ['off'],
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/lines-around-comment': ['error', {
        beforeBlockComment: true,
        afterBlockComment: false,
        beforeLineComment: true,
        afterLineComment: false,
        allowBlockStart: false,
        allowBlockEnd: false,
        allowClassStart: false,
        allowClassEnd: false,
        allowObjectStart: false,
        allowObjectEnd: false,
        allowArrayStart: true,
        allowArrayEnd: false,
        applyDefaultIgnorePatterns: true,
        afterHashbangComment: true
      }],
      '@stylistic/lines-between-class-members': ['error', 'always'],
      '@stylistic/max-len': ['warn', {
        code: 120,
        tabWidth: 2,
        ignoreComments: false,
        ignoreTrailingComments: false,
        ignoreUrls: true,
        ignoreStrings: false,
        ignoreTemplateLiterals: true
      }],
      '@stylistic/max-statements-per-line': ['error', {
        max: 1,
        ignoredNodes: ['BreakStatement']
      }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true
        },
        singleline: {
          delimiter: 'comma',
          requireLast: false
        },
        multilineDetection: 'brackets'
      }],
      '@stylistic/multiline-comment-style': ['error', 'starred-block'],
      '@stylistic/multiline-ternary': ['error', 'always'],
      '@stylistic/new-parens': ['error', 'always'],
      // '@stylistic/newline-per-chained-call': ['error', {
      //   ignoreChainWithDepth: 1 // currently 'broken', in favor of custom rule custom/newline-per-chained-call
      // }],
      '@stylistic/no-confusing-arrow': ['error', {
        allowParens: true,
        onlyOneSimpleParam: false
      }],
      '@stylistic/no-extra-parens': ['error', 'all', {
        ignoreJSX: 'all',
        enforceForArrowConditionals: false,
				nestedBinaryExpressions: false
      }],
      '@stylistic/no-extra-semi': ['error'],
      '@stylistic/no-floating-decimal': ['error'],
      '@stylistic/no-mixed-operators': ['error'],
      '@stylistic/no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
      '@stylistic/no-multi-spaces': ['error'],
      '@stylistic/no-multiple-empty-lines': ['error', {
        max: 1
      }],
      '@stylistic/no-tabs': ['off'],
      '@stylistic/no-trailing-spaces': ['error'],
      '@stylistic/no-whitespace-before-property': ['error'],
      '@stylistic/nonblock-statement-body-position': ['error', 'below'],
      '@stylistic/object-curly-newline': ['error', {
        multiline: true,
        minProperties: 2,
        consistent: false
      }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/object-property-newline': ['error', {
        allowAllPropertiesOnSameLine: false
      }],
      '@stylistic/one-var-declaration-per-line': ['error', 'always'],
      '@stylistic/operator-linebreak': ['error', 'before'],
      '@stylistic/padded-blocks': ['error', 'always', {
        allowSingleLineBlocks: true
      }],
      '@stylistic/padding-line-between-statements': ['off'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: false,
        allowTemplateLiterals: 'avoidEscape',
        ignoreStringLiterals: false
      }],
      '@stylistic/rest-spread-spacing': ['error', 'never'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-spacing': ['error', {
        before: false,
        after: true
      }],
      '@stylistic/semi-style': ['error', 'last'],
      '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'never',
        catch: 'never'
      }],
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/space-infix-ops': ['error', {
        int32Hint: true,
        ignoreTypes: false
      }],
      '@stylistic/space-unary-ops': ['error', {
        words: true,
        nonwords: false
      }],
      '@stylistic/spaced-comment': ['error', 'always', {
        exceptions: ['-', '+']
      }],
      '@stylistic/switch-colon-spacing': ['error', {
        after: true,
        before: false
      }],
      '@stylistic/template-curly-spacing': ['error', 'never'],
      '@stylistic/template-tag-spacing': ['error', 'always'],
      '@stylistic/type-annotation-spacing': ['error', {
        before: false,
        after: true
      }],
      '@stylistic/type-generic-spacing': ['error'],
      '@stylistic/type-named-tuple-spacing': ['error'],
      '@stylistic/wrap-iife': ['error', 'inside', {
        functionPrototypeMethods: true
      }],
      '@stylistic/wrap-regex': ['error'],
      '@stylistic/yield-star-spacing': ['error', 'after'],
		}
	},
	{ // eslint-plugin-import
		name: 'eslint-plugin-import',
		files: ['**/*.{ts,tsx,js,jsx}'],
		extends: [eslintPluginImport.flatConfigs.recommended, eslintPluginImport.flatConfigs.typescript],
		settings: {
			'import-x/resolver': {
				typescript: true,
				node: true
			}
		},
		rules: {
			'import-x/export': 'error',
			'import-x/no-deprecated': 'error',
			'import-x/no-empty-named-blocks': 'error',
			'import-x/no-extraneous-dependencies': ['error', {
				devDependencies: true,
				optionalDependencies: true,
				peerDependencies: true,
				bundledDependencies: true
			}],
			'import-x/no-mutable-exports': 'error',
			'import-x/no-named-as-default': 'off',
			'import-x/no-named-as-default-member': 'off',
			'import-x/no-rename-default': 'off',

			'import-x/no-amd': 'error',
			'import-x/no-commonjs': 'error',
			'import-x/no-import-module-exports': 'error',
			'import-x/no-nodejs-modules': 'off',
			'import-x/unambiguous': 'error',

			'import-x/default': 'error',
			'import-x/named': 'error',
			'import-x/namespace': 'error',
			'import-x/no-absolute-path': 'error',
			'import-x/no-cycle': 'off',
			'import-x/no-dynamic-require': 'error',
			'import-x/no-internal-modules': 'off',
			'import-x/no-relative-packages': 'error',
			'import-x/no-relative-parent-imports': 'off',
			'import-x/no-restricted-paths': ['error', {
				zones: [
					{
						target: './src/frontend/**/*',
						from: './src/backend/**/*'
					},
					{
						target: './src/backend/**/*',
						from: './src/frontend/**/*'
					},
					{
						target: './src/**/*.astro',
						from: './src/frontend/**/*'
					}
				]
			}],
			'import-x/no-self-import': 'error',
			'import-x/no-unresolved': 'error',
			'import-x/no-useless-path-segments': 'error',
			'import-x/no-webpack-loader-syntax': 'error',

			'import-x/consistent-type-specifier-style': ['error', 'prefer-inline'],
			'import-x/dynamic-import-chunkname': 'off',
			'import-x/export-last': 'off',
			'import-x/extensions': 'off',
			'import-x/first': 'error',
			'import-x/group-exports': 'off',
			'import-x/imports-first': 'off', // Replaced by 'import/first'
			'import-x/max-dependencies': 'off',
			'import-x/newline-after-import': ['error', {
				considerComments: true
			}],
			'import-x/no-anonymous-default-export': 'off', // See next rule
			'import-x/no-default-export': 'error',
			'import-x/no-duplicates': 'error',
			'import-x/no-named-default': 'off', // In favor of 'import/no-default-export'
			'import-x/no-named-export': 'off',
			'import-x/no-namespace': 'off',
			'import-x/no-unassigned-import': ['error', {
				allow: ['styles/*.css']
			}],
			'import-x/order': 'error',
			'import-x/prefer-default-export': 'off',
			'import-x/prefer-namespace-import': 'off'
		}
	},
  { // eslint-custom
    name: 'eslint-custom',
		files: ['**/*.{ts,js,tsx,jsx}'],
    plugins: { 'custom': eslintCustom },
		rules: {
      'custom/function-args-newline': 'error',
      'custom/condition-paren-newline': 'error',
			'custom/newline-per-chained-call': 'error'
    }
  },
	{ // eslint-rules
		name: 'eslint-rules'
		
	}
]);
