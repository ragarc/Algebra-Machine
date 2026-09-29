import type { Expr } from '../types';
import type { PatternExpr, Identity, Bindings } from './identities';
import { MATH_IDENTITIES } from './identities';

/**
 * Attempts to match a target AST node against a pattern expression.
 * Returns bindings if the match succeeds, or null if it fails.
 */
export function matchPattern(
  pattern: PatternExpr,
  expr: Expr,
  bindings: Bindings = {}
): Bindings | null {
  // Wildcards match any sub-expression
  if (pattern.kind === 'Wildcard') {
    const existing = bindings[pattern.name];
    if (existing) {
      // If variable was already bound, verify equality
      return areExprsEqual(existing, expr) ? bindings : null;
    }
    return { ...bindings, [pattern.name]: expr };
  }

  // Node kinds must match
  if (pattern.kind !== expr.kind) {
    return null;
  }

  // Kind-specific structural matching
  switch (pattern.kind) {
    case 'Const':
      return expr.kind === 'Const' && pattern.value === expr.value ? bindings : null;

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

    default:
      return null;
  }
}

/**
 * Structural structural equality helper for AST nodes.
 */
function areExprsEqual(a: Expr, b: Expr): boolean {
  if (a.kind !== b.kind) return false;

  switch (a.kind) {
    case 'Const':
      return b.kind === 'Const' && a.value === b.value;
    case 'Var':
      return b.kind === 'Var' && a.name === b.name;
    case 'Plus':
    case 'Minus':
    case 'Times':
      return b.kind === a.kind && areExprsEqual(a.left, b.left) && areExprsEqual(a.right, b.right);
    case 'Frac':
      return b.kind === 'Frac' && areExprsEqual(a.num, b.num) && areExprsEqual(a.den, b.den);
    case 'Pow':
      return b.kind === 'Pow' && areExprsEqual(a.base, b.base) && areExprsEqual(a.exponent, b.exponent);
    default:
      return false;
  }
}

export interface MatchResult {
  identity: Identity;
  bindings: Bindings;
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
    const bindings = matchPattern(identity.pattern, targetExpr);
    if (bindings) {
      matches.push({ identity, bindings });
    }
  }

  return matches;
}