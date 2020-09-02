/**
 * https://github.com/eslint/eslint-scope/blob/master/lib/scope.js
 */
const reservedKeywords = new Set([
    'undefined',
    'Infinity',
    'NaN',
    'true',
    'false',
]);

const isAllowedIdentifier = (node) => {
    if (reservedKeywords.has(node.name)) {
        return true;
    }
    const {parent} = node;
    switch (parent && parent.type) {
    case 'TSMethodSignature':
        return parent.key === node || parent.params.includes(node);
    case 'Property':
    case 'ClassProperty':
    case 'MethodDefinition':
    case 'TSPropertySignature':
        return parent.key === node;
    case 'TSTypeParameter':
        return parent.name === node;
    case 'TSQualifiedName':
        return parent.right === node || parent.left === node;
    case 'TSModuleDeclaration':
    case 'TSTypeAliasDeclaration':
    case 'TSInterfaceDeclaration':
        return parent.id === node;
    case 'TSTypeReference':
        return parent.typeName === node;
    case 'MemberExpression':
        return parent.property === node;
    case 'ImportSpecifier':
        return parent.imported === node;
    case 'ExportSpecifier':
        return parent.exported === node;
    case 'TSTypePredicate':
        return parent.parameterName === node;
    case 'TSFunctionType':
    case 'TSCallSignatureDeclaration':
        return parent.params.includes(node);
    case 'TSIndexSignature':
        return parent.parameters.includes(node);
    case 'TSInterfaceHeritage':
        return parent.expression === node;
    case 'RestElement':
        switch (parent.parent && parent.parent.type) {
        case 'TSCallSignatureDeclaration':
        case 'TSFunctionType':
            return true;
        default:
            return false;
        }
    default:
    }
    return false;
};

const isDeclared = (scope, name) => {
    if (!scope || scope.type === 'global') {
        return false;
    }
    for (const variable of scope.variables) {
        if (variable.name === name) {
            const [definition = {}] = variable.defs;
            switch (definition.type) {
            case 'ImportBinding':
            case 'Parameter':
            case 'Variable':
            case 'CatchClause':
            case 'FunctionName':
            case 'ClassName':
                return true;
            default:
                return false;
            }
        }
    }
    return isDeclared(scope.upper, name);
};

module.exports = {
    'restrict-globals': {
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
                undef: '\'{{name}}\' is not defined. ({{parentType}})',
            },
        },
        create: (context) => {
            const allowed = new Set(context.options.reduce(
                (concatenated, {allowed = []}) => concatenated.concat(allowed),
                [],
            ));
            return {
                Identifier: (node) => {
                    if (allowed.has(node.name) || isAllowedIdentifier(node)) {
                        return;
                    }
                    const scope = context.getScope();
                    if (!isDeclared(scope, node.name)) {
                        context.report({
                            node,
                            messageId: 'undef',
                            data: {...node, parentType: node.parent && node.parent.type},
                        });
                    }
                },
            };
        },
    },
    'print-filename': {
        create: (context) => {
            const starts = new Map();
            return {
                'Program': () => {
                    const filename = context.getFilename();
                    starts.set(filename, process.hrtime());
                },
                'Program:exit': () => {
                    const filename = context.getFilename();
                    const start = starts.get(filename);
                    const [s, ns] = process.hrtime(start);
                    const elapsed = s === 0
                    ? `${(ns / 1e6).toFixed(3)}ms`
                    : `${(s + ns / 1e6).toFixed(3)}s`;
                    console.log(`${filename} (${elapsed})`);
                },
            };
        },
    },
};
