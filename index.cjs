//@ts-check
/** @typedef {import('./type').Rules} Rules */
/** @typedef {import('./type').RuleContext} RuleContext */
/** @typedef {import('./type').Scope} Scope */
/** @typedef {import('./type').Variable} Variable */
/** @typedef {import('./type').Identifier} Identifier */

const reservedIdentifiers = new Set([
  'undefined',
  'Infinity',
  'NaN',
  'true',
  'false',
]);

/**
 * @param {Identifier} node
 * @returns {boolean}
 */
const isNonVariableIdentifier = (node) => {
  if (reservedIdentifiers.has(node.name)) {
    return true;
  }
  const { parent } = node;
  if (!parent) {
    return false;
  }
  switch (parent.type) {
    case 'TSMethodSignature':
      return parent.key === node || parent.params.includes(node);
    case 'PropertyDefinition':
    case 'Property':
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

/**
 *
 * @param {Scope | null} scope
 * @param {string} name
 * @returns {Variable | null}
 */
const getVariable = (scope, name) => {
  if (scope) {
    return scope.set.get(name) || getVariable(scope.upper, name);
  }
  return null;
};

/**
 * @param {Variable | null} variable
 * @returns {boolean}
 */
const isLocallyDeclaredVariable = (variable) => {
  if (!variable) {
    return false;
  }
  const [definition] = variable.defs;
  switch (definition && definition.type) {
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

/**
 * @param {Variable | null} variable
 * @returns {boolean}
 */
const isTypeVariable = (variable) => {
  if (variable) {
    //@ts-ignore
    return variable.isTypeVariableVariable && !variable.isValueVariable;
  }
  return false;
};

/**
 * @param {RuleContext} context
 * @returns {Array<string>}
 */
const getGlobalVariableNameList = (context) => {
  const globalVariableNameList = [];
  if (context.settings?.env?.node) {
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

/** @type {Rules} */
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
      /**
       * @param {Identifier} node
       * @returns {boolean}
       */
      const isAllowedIdentifier = (node) =>
        allowedVariableNameList.has(node.name);
      return {
        Identifier: (node) => {
          // @ts-ignore
          if (isNonVariableIdentifier(node) || isAllowedIdentifier(node)) {
            return;
          }
          const variable = getVariable(context.getScope(), node.name);
          if (isTypeVariable(variable)) {
            return;
          }
          if (!isLocallyDeclaredVariable(variable)) {
            /** @type {Record<string, string>} */
            const data = {};
            for (const [key, value] of Object.entries(node)) {
              if (typeof value === 'string') {
                data[key] = value;
              }
            }
            data.parentType = node.parent && node.parent.type;
            context.report({ node, messageId: 'undef', data });
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
          starts.set(context.filename, process.hrtime());
        },
        'Program:exit': () => {
          const start = starts.get(context.filename);
          const [s, ns] = process.hrtime(start);
          const elapsed =
            s === 0
              ? `${(ns / 1e6).toFixed(3)}ms`
              : `${(s + ns / 1e6).toFixed(3)}s`;
          console.log(
            `${context.filename.slice(context.cwd.length)} (${elapsed})`,
          );
        },
      };
    },
  },
};
