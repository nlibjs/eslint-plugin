export interface CommitLintConfig {
    parserPreset: string,
    rules: {
        [ruleName: string]: [
            0 | 1 | 2,
            'always' | 'never',
            undefined | number | string | Array<string>,
        ],
        'type-enum': [
            0 | 1 | 2,
            'always' | 'never',
            Array<string>,
        ],
    },
}
declare const config: CommitLintConfig;
export default config;
