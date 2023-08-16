import * as ast from '@typescript-eslint/types/dist/generated/ast-spec';
import { Rule, Scope } from 'eslint';
export type RuleModule = Rule.RuleModule;
export type RuleContext = Rule.RuleContext;
export type Scope = Scope.Scope;
export type Variable = Scope.Variable;
interface Node extends ast.Node {
  parent?: ast.Node;
}
interface NodeParentExtension {
  parent: ast.Node & NodeParentExtension;
}
export type Identifier = ast.Identifier & NodeParentExtension;
