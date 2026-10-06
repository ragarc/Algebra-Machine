import { parseLatexToAST } from '../ast';
import type { Expr } from '../types';
import type { PatternExpr, Identity } from './identities';

/**
 * Transforms a concrete Expr parsed from a string into a PatternExpr.
 * By default, converts all 'Var' nodes into 'Wildcard' nodes.
 */
export function exprToPattern(
  expr: Expr,
  // Optional set of variable names to keep as literal variables instead of wildcards
  concreteVars: Set<string> = new Set()
): PatternExpr {
  switch (expr.kind) {
    case 'Var':
      if (concreteVars.has(expr.name)) {
        // Keeps specific variables literal if needed (e.g. constant symbols or index variables)
        return { kind: 'Var', name: expr.name } as unknown as PatternExpr;
      }
      return { kind: 'Wildcard', name: expr.name };

    case 'Const':
      return { kind: 'Const', value: expr.value };

    case 'Plus':
    case 'Minus':
    case 'Times':
      return {
        kind: expr.kind,
        left: exprToPattern(expr.left, concreteVars),
        right: exprToPattern(expr.right, concreteVars),
      };

    case 'Frac':
      return {
        kind: 'Frac',
        num: exprToPattern(expr.num, concreteVars),
        den: exprToPattern(expr.den, concreteVars),
      };

    case 'Pow':
      return {
        kind: 'Pow',
        base: exprToPattern(expr.base, concreteVars),
        exponent: exprToPattern(expr.exponent, concreteVars),
      };

    case 'FnCall':
      return {
        kind: 'FnCall',
        name: expr.name,
        args: expr.args.map((arg) => exprToPattern(arg, concreteVars)),
      };

    case 'Neg':
      // If your AST represents unary negations as Neg, normalize or handle them
      return {
        kind: 'Times',
        left: { kind: 'Const', value: { type: 'number', value: -1 } },
        right: exprToPattern(expr.term, concreteVars),
      };
  }
}

export function defineIdentity(
  id: string,
  name: string,
  ruleStr: string,
  concreteVars?: string[]
): Identity {
  const [lhsStr, rhsStr] = ruleStr.split('=').map((s) => s.trim());

  if (!lhsStr || !rhsStr) {
    throw new Error(`Invalid identity rule "${ruleStr}". Must contain '='`);
  }

  const literalSet = new Set(concreteVars);

  const lhsExpr = parseLatexToAST(lhsStr);
  const rhsExpr = parseLatexToAST(rhsStr);

  return {
    id,
    name,
    lhs: exprToPattern(lhsExpr, literalSet),
    rhs: exprToPattern(rhsExpr, literalSet),
  };
}