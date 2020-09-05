/**
 * @type {import('./commitlint.config').CommitLintConfig}
 */
const {parserPreset, rules} = require('@commitlint/config-conventional');
module.exports = {
    parserPreset,
    rules: {
        ...rules,
        'type-enum': [
            2,
            'always',
            rules['type-enum'][2].concat('deps'),
        ],
    },
};
