import type { Expr } from '../types';
import type { PatternExpr, Bindings } from './identities';
import type { MatchResult } from './matcher';

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
  }
}

/**
 * Traverses `rootExpr` and replaces the node matching `targetExpr` with `replacement`.
 * Returns a brand-new, immutably updated AST root.
 */
export function replaceSubtree(rootExpr: Expr, targetExpr: Expr, replacement: Expr): Expr {
  if (rootExpr === targetExpr) {
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
      return { kind: 'Neg', term: replaceSubtree(rootExpr.term, targetExpr, replacement) };
    case 'Sqrt':
      return { kind: 'Sqrt', term: replaceSubtree(rootExpr.term, targetExpr, replacement) };
    case 'Sin':
      return { kind: 'Sin', term: replaceSubtree(rootExpr.term, targetExpr, replacement) };
    case 'Cos':
      return { kind: 'Cos', term: replaceSubtree(rootExpr.term, targetExpr, replacement) };
    case 'Exp':
      return { kind: 'Exp', term: replaceSubtree(rootExpr.term, targetExpr, replacement) };
    case 'Const':
    case 'Var':
      return rootExpr;
  }
}

/**
 * Executes a full identity transformation on a target AST node within the main tree.
 */
export function applyIdentity(rootExpr: Expr, targetExpr: Expr, match: MatchResult): Expr {
  const rewrittenSubtree = instantiatePattern(match.identity.result, match.bindings);
  return replaceSubtree(rootExpr, targetExpr, rewrittenSubtree);
}