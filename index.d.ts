interface Option {
    allowed: Array<string>,
}
interface Context {
    options: Array<Option>,
}
interface Node {}
interface RuleModule {
    create: (context: Context) => {
        [nodeType: string]: (node: Node) => void,
    },
}
declare const plugin: {
    'restrict-globals': RuleModule & {
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
export default plugin;
