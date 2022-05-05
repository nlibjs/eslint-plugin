import {RuleTester} from 'eslint';
import {rules} from '../index.mjs';

const tester = new RuleTester({
    parser: new URL('../node_modules/@typescript-eslint/parser/dist/index.js', import.meta.url).pathname,
});

tester.run(
    'no-globals',
    rules['no-globals'],
    {
        valid: [
            {code: '1 + 1'},
            {code: 'undefined'},
            {code: 'null'},
            {code: 'NaN'},
            {code: 'true'},
            {code: 'false'},
            {code: 'Object.assign()', options: [{allowed: ['Object']}]},
            {code: 'interface Foo {};class Bar implements Foo {}'},
            {code: 'const foo: Bar = 0'},
            {code: 'const foo: Foo.Bar = 0'},
            {code: [
                'class Foo {',
                '    protected readonly foo: string',
                '    protected constructor() {',
                '        this.foo = "";',
                '    }',
                '}',
            ].join('\n')},
            {
                code: 'module.parent',
                settings: {env: {node: true}},
            },
            {
                code: 'require()',
                settings: {env: {node: true}},
            },
            {
                code: 'require(__dirname, __filename)',
                settings: {env: {node: true}},
            },
        ],
        invalid: [
            {
                code: 'module.parent',
                errors: ['\'module\' is not defined. (MemberExpression)'],
            },
            {
                code: 'require',
                errors: ['\'require\' is not defined. (ExpressionStatement)'],
            },
            {
                code: 'require(__dirname, __filename)',
                errors: [
                    '\'require\' is not defined. (CallExpression)',
                    '\'__dirname\' is not defined. (CallExpression)',
                    '\'__filename\' is not defined. (CallExpression)',
                ],
            },
            {
                code: 'process.exit(1)',
                errors: ['\'process\' is not defined. (MemberExpression)'],
            },
            {
                code: 'Object.assign()',
                errors: ['\'Object\' is not defined. (MemberExpression)'],
            },
        ],
    },
);
