import type { Expr, ConstValue } from '../types';
import type { PatternExpr, Identity, Bindings } from '../identities/identities';
import { MATH_IDENTITIES } from '../identities/identities';

/**
 * Structural equality helper to compare AST nodes by value rather than reference.
 */
function isSameConst(a: ConstValue, b: ConstValue): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'number' && b.type === 'number') {
    return a.value === b.value;
  }
  if (a.type === 'symbol' && b.type === 'symbol') {
    return a.symbol === b.symbol;
  }
  return false;
}

export function isSameExpr(a: Expr, b: Expr): boolean {
  if (a === b) return true;
  if (a.kind !== b.kind) return false;

  switch (a.kind) {
    case 'Const':
      return b.kind === 'Const' && isSameConst(a.value, b.value);

    case 'Var':
      return b.kind === 'Var' && a.name === b.name;

    case 'Neg':
      return b.kind === 'Neg' && isSameExpr(a.term, b.term);

    case 'Plus':
      return b.kind === 'Plus' && isSameExpr(a.left, b.left) && isSameExpr(a.right, b.right);

    case 'Minus':
      return b.kind === 'Minus' && isSameExpr(a.left, b.left) && isSameExpr(a.right, b.right);

    case 'Times':
      return b.kind === 'Times' && isSameExpr(a.left, b.left) && isSameExpr(a.right, b.right);

    case 'Frac':
      return b.kind === 'Frac' && isSameExpr(a.num, b.num) && isSameExpr(a.den, b.den);

    case 'Pow':
      return b.kind === 'Pow' && isSameExpr(a.base, b.base) && isSameExpr(a.exponent, b.exponent);

    case 'FnCall':
      return (
        b.kind === 'FnCall' &&
        a.name === b.name &&
        a.args.length === b.args.length &&
        a.args.every((arg, idx) => isSameExpr(arg, b.args[idx]))
      );
  }
}

/**
 * Attempts to match a target AST node against a pattern expression.
 * Returns bindings if the match succeeds, or null if it fails.
 */
export function matchPattern(
  pattern: PatternExpr,
  expr: Expr,
  bindings: Bindings = {}
): Bindings | null {
  if (pattern.kind === 'Wildcard') {
    const existing = bindings[pattern.name];
    if (existing) {
      return isSameExpr(existing, expr) ? bindings : null;
    }
    return { ...bindings, [pattern.name]: expr };
  }

  if (pattern.kind !== expr.kind) {
    return null;
  }

  switch (pattern.kind) {
    case 'Const':
      return expr.kind === 'Const' && isSameConst(pattern.value, expr.value) ? bindings : null;

    case 'Plus':
    case 'Minus':
    case 'Times': {
      if (expr.kind !== pattern.kind) return null;
      const leftBindings = matchPattern(pattern.left, expr.left, bindings);
      if (!leftBindings) return null;
      return matchPattern(pattern.right, expr.right, leftBindings);
    }

    case 'Frac': {
      if (expr.kind !== 'Frac') return null;
      const numBindings = matchPattern(pattern.num, expr.num, bindings);
      if (!numBindings) return null;
      return matchPattern(pattern.den, expr.den, numBindings);
    }

    case 'Pow': {
      if (expr.kind !== 'Pow') return null;
      const baseBindings = matchPattern(pattern.base, expr.base, bindings);
      if (!baseBindings) return null;
      return matchPattern(pattern.exponent, expr.exponent, baseBindings);
    }

    case 'FnCall': {
      if (
        expr.kind !== 'FnCall' ||
        pattern.name !== expr.name ||
        pattern.args.length !== expr.args.length
      ) {
        return null;
      }
      let currentBindings = bindings;
      for (let i = 0; i < pattern.args.length; i++) {
        const res = matchPattern(pattern.args[i], expr.args[i], currentBindings);
        if (!res) return null;
        currentBindings = res;
      }
      return currentBindings;
    }

    default:
      return null;
  }
}

export interface MatchResult {
  identity: Identity;
  bindings: Bindings;
  direction: 'forward' | 'reverse';
}

/**
 * Finds all mathematical identities that match a given target AST node.
 */
export function findMatchingIdentities(
  targetExpr: Expr,
  identities: Identity[] = MATH_IDENTITIES
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const identity of identities) {
    const lhsBindings = matchPattern(identity.lhs, targetExpr);
const rhsBindings = matchPattern(identity.rhs, targetExpr);
    if (lhsBindings) {
  matches.push({
    identity,
    bindings: lhsBindings,
    direction: 'forward',
  });
} else if (rhsBindings) {
  matches.push({
    identity,
    bindings: rhsBindings,
    direction: 'reverse',
  });
}
  }
  return matches;
}