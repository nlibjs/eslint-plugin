import eslint from 'eslint';
import * as restrictGlobals from '../restrict-globals.js';

const ruleTester = new eslint.RuleTester();

ruleTester.run(
    'restrict-globals',
    restrictGlobals,
    {
        valid: [
            {code: '1 + 1'},
            {code: 'undefined;'},
            {code: 'null;'},
            {code: 'Object.assign();', options: [{allowed: ['Object']}]},
        ],
        invalid: [
            {
                code: 'Object.assign();',
                errors: ['\'Object\' is not defined. (MemberExpression)'],
            },
        ],
    },
);
