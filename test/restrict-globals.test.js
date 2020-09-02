const {RuleTester} = require('eslint');
const plugin = require('../index.js');

const ruleTester = new RuleTester();

ruleTester.run(
    'restrict-globals',
    plugin['restrict-globals'],
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
