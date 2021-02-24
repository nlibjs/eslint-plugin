import * as path from 'path';
import {RuleTester} from 'eslint';
import {rules} from '../index.js';

const ruleTester = new RuleTester({
    parser: path.join(__dirname, '../node_modules/@typescript-eslint/parser/dist/index.js'),
});

ruleTester.run(
    'no-globals',
    rules['no-globals'],
    {
        valid: [
            {code: '1 + 1'},
            {code: 'undefined;'},
            {code: 'null;'},
            {code: 'Object.assign();', options: [{allowed: ['Object']}]},
            {code: 'interface Foo {};class Bar implements Foo {}'},
        ],
        invalid: [
            {
                code: 'Object.assign();',
                errors: ['\'Object\' is not defined. (MemberExpression)'],
            },
        ],
    },
);
