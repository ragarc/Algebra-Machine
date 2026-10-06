import type { Expr } from '../types';
import type { PatternExpr, Bindings } from '../identities/identities';
import type { MatchResult } from './matcher';
import { isSameExpr } from './matcher';

/**
 * Replaces Wildcard placeholders in a RHS PatternExpr using the provided bindings
 * to produce a concrete, standard Expr.
 */
export function instantiatePattern(pattern: PatternExpr, bindings: Bindings): Expr {
  switch (pattern.kind) {
    case 'Wildcard': {
      const boundExpr = bindings[pattern.name];
      if (!boundExpr) {
        throw new Error(`Unbound wildcard variable "${pattern.name}" in identity result.`);
      }
      return boundExpr;
    }
    case 'Const':
      return { kind: 'Const', value: pattern.value };
    case 'Plus':
      return {
        kind: 'Plus',
        left: instantiatePattern(pattern.left, bindings),
        right: instantiatePattern(pattern.right, bindings),
      };
    case 'Minus':
      return {
        kind: 'Minus',
        left: instantiatePattern(pattern.left, bindings),
        right: instantiatePattern(pattern.right, bindings),
      };
    case 'Times':
      return {
        kind: 'Times',
        left: instantiatePattern(pattern.left, bindings),
        right: instantiatePattern(pattern.right, bindings),
      };
    case 'Frac':
      return {
        kind: 'Frac',
        num: instantiatePattern(pattern.num, bindings),
        den: instantiatePattern(pattern.den, bindings),
      };
    case 'Pow':
      return {
        kind: 'Pow',
        base: instantiatePattern(pattern.base, bindings),
        exponent: instantiatePattern(pattern.exponent, bindings),
      };
    case 'FnCall':
      return {
        kind: 'FnCall',
        name: pattern.name,
        args: pattern.args.map((arg) => instantiatePattern(arg, bindings)),
      };
  }
}

/**
 * Traverses `rootExpr` and replaces the node matching `targetExpr` with `replacement`.
 * Returns a brand-new, immutably updated AST root.
 */
export function replaceSubtree(rootExpr: Expr, targetExpr: Expr, replacement: Expr): Expr {
  if (isSameExpr(rootExpr, targetExpr)) {
    return replacement;
  }

  switch (rootExpr.kind) {
    case 'Plus':
      return {
        kind: 'Plus',
        left: replaceSubtree(rootExpr.left, targetExpr, replacement),
        right: replaceSubtree(rootExpr.right, targetExpr, replacement),
      };
    case 'Minus':
      return {
        kind: 'Minus',
        left: replaceSubtree(rootExpr.left, targetExpr, replacement),
        right: replaceSubtree(rootExpr.right, targetExpr, replacement),
      };
    case 'Times':
      return {
        kind: 'Times',
        left: replaceSubtree(rootExpr.left, targetExpr, replacement),
        right: replaceSubtree(rootExpr.right, targetExpr, replacement),
      };
    case 'Frac':
      return {
        kind: 'Frac',
        num: replaceSubtree(rootExpr.num, targetExpr, replacement),
        den: replaceSubtree(rootExpr.den, targetExpr, replacement),
      };
    case 'Pow':
      return {
        kind: 'Pow',
        base: replaceSubtree(rootExpr.base, targetExpr, replacement),
        exponent: replaceSubtree(rootExpr.exponent, targetExpr, replacement),
      };
    case 'Neg':
      return {
        kind: 'Neg',
        term: replaceSubtree(rootExpr.term, targetExpr, replacement),
      };
    case 'FnCall':
      return {
        kind: 'FnCall',
        name: rootExpr.name,
        args: rootExpr.args.map((arg) => replaceSubtree(arg, targetExpr, replacement)),
      };
    case 'Const':
    case 'Var':
      return rootExpr;
  }
}


export function applyIdentity(
  rootExpr: Expr,
  targetExpr: Expr,
  match: MatchResult
): Expr {
  const replacementPattern =
    match.direction === 'forward'
      ? match.identity.rhs
      : match.identity.lhs;

  const replacement = instantiatePattern(
    replacementPattern,
    match.bindings
  );

  return replaceSubtree(rootExpr, targetExpr, replacement);
}