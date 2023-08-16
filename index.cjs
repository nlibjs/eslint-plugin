/**
 * https://github.com/eslint/eslint-scope/blob/master/lib/scope.js
 */
/** @typedef {{allowed: Array<string>}} Option */
/** @typedef {{options: Array<Option>}} Context */
/** @typedef {{}} Node */
/** @typedef {{create: (context: Context) => {[nodeType: string]: (node: Node) => void}}} RuleModule */

const reservedIdentifiers = new Set([
  'undefined',
  'Infinity',
  'NaN',
  'true',
  'false',
]);
const isNonVariableIdentifier = (node) => {
  if (reservedIdentifiers.has(node.name)) {
    return true;
  }
  const { parent } = node;
  switch (parent && parent.type) {
    case 'TSMethodSignature':
      return parent.key === node || parent.params.includes(node);
    case 'PropertyDefinition':
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
    case 'TSClassImplements':
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
      return false;
  }
};
const getVariable = (scope, name) => {
  if (scope) {
    return scope.set.get(name) || getVariable(scope.upper, name);
  }
  return null;
};
const isLocallyDeclaredVariable = (variable) => {
  if (!variable) {
    return false;
  }
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
};
const isTypeVariable = (variable) =>
  Boolean(
    variable && variable.isTypeVariableVariable && !variable.isValueVariable,
  );
const getGlobalVariableNameList = ({ settings: { env = {} } = {} }) => {
  const globalVariableNameList = [];
  if (env.node) {
    globalVariableNameList.push(
      '__dirname',
      '__filename',
      'module',
      'require',
      'import',
    );
  }
  return globalVariableNameList;
};

/** @type {{'no-globals': RuleModule, 'print-filename': RuleModule}} */
exports.rules = {
  'no-globals': {
    meta: {
      type: 'problem',
      schema: [
        {
          type: 'object',
          propeties: {
            allowed: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      ],
      messages: {
        undef: "'{{name}}' is not defined. ({{parentType}})",
      },
    },
    create: (context) => {
      const allowedVariableNameList = new Set(
        context.options.reduce(
          (concatenated, { allowed = [] }) => concatenated.concat(allowed),
          getGlobalVariableNameList(context),
        ),
      );
      const isAllowedIdentifier = (node) =>
        allowedVariableNameList.has(node.name);
      return {
        Identifier: (node) => {
          if (isNonVariableIdentifier(node) || isAllowedIdentifier(node)) {
            return;
          }
          const variable = getVariable(context.getScope(), node.name);
          if (isTypeVariable(variable)) {
            return;
          }
          if (!isLocallyDeclaredVariable(variable)) {
            context.report({
              node,
              messageId: 'undef',
              data: { ...node, parentType: node.parent && node.parent.type },
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
        Program: () => {
          const filename = context.getFilename();
          starts.set(filename, process.hrtime());
        },
        'Program:exit': () => {
          const filename = context.getFilename();
          const start = starts.get(filename);
          const [s, ns] = process.hrtime(start);
          const elapsed =
            s === 0
              ? `${(ns / 1e6).toFixed(3)}ms`
              : `${(s + ns / 1e6).toFixed(3)}s`;
          console.log(`${filename} (${elapsed})`);
        },
      };
    },
  },
};
