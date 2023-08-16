//@ts-check
import { RuleTester } from 'eslint';
import { createRequire } from 'node:module';
import { rules as mjsRules } from '../index.mjs';
import { rules as cjsRules } from '../index.cjs';

const require = createRequire(import.meta.url);
const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});
/** @type {Array<RuleTester.ValidTestCase>} */
const valid = [
  { code: '1 + 1' },
  { code: 'undefined' },
  { code: 'null' },
  { code: 'NaN' },
  { code: 'true' },
  { code: 'false' },
  { code: 'Object.assign()', options: [{ allowed: ['Object'] }] },
  { code: 'interface Foo {};class Bar implements Foo {}' },
  { code: 'const foo: Bar = 0' },
  { code: 'const foo: Foo.Bar = 0' },
  {
    code: [
      'class Foo {',
      '    protected readonly foo: string',
      '    protected constructor() {',
      '        this.foo = "";',
      '    }',
      '}',
    ].join('\n'),
  },
  {
    code: 'module.parent',
    settings: { env: { node: true } },
  },
  {
    code: 'require()',
    settings: { env: { node: true } },
  },
  {
    code: 'require(__dirname, __filename)',
    settings: { env: { node: true } },
  },
];
/** @type {Array<RuleTester.InvalidTestCase>} */
const invalid = [
  {
    code: 'module.parent',
    errors: ["'module' is not defined. (MemberExpression)"],
  },
  {
    code: 'require',
    errors: ["'require' is not defined. (ExpressionStatement)"],
  },
  {
    code: 'require(__dirname, __filename)',
    errors: [
      "'require' is not defined. (CallExpression)",
      "'__dirname' is not defined. (CallExpression)",
      "'__filename' is not defined. (CallExpression)",
    ],
  },
  {
    code: 'process.exit(1)',
    errors: ["'process' is not defined. (MemberExpression)"],
  },
  {
    code: 'Object.assign()',
    errors: ["'Object' is not defined. (MemberExpression)"],
  },
];
tester.run('no-globals', mjsRules['no-globals'], { valid, invalid });
tester.run('no-globals', cjsRules['no-globals'], { valid, invalid });
console.info('passed');
