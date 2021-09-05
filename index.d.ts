interface Option {
    allowed: Array<string>,
}
interface Context {
    options: Array<Option>,
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Node {}
interface RuleModule {
    create: (context: Context) => {
        [nodeType: string]: (node: Node) => void,
    },
}
export const rules: {
    'no-globals': RuleModule & {
        meta: {
            type: 'problem',
            schema: [
                {
                    type: 'object',
                    propeties: {
                        allowed: {
                            type: 'array',
                            items: {type: 'string'},
                        },
                    },
                },
            ],
            messages: {
                undef: string,
            },
        },
    },
    'print-filename': RuleModule,
};
