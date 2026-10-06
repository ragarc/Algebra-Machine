import type { Expr, ConstValue } from '../types';
import { defineIdentity } from './list';

// Wildcard variables for identity patterns (e.g., 'A', 'B', 'C')
export type PatternExpr =
  | { kind: 'Const'; value: ConstValue }
  | { kind: 'Wildcard'; name: string }
  | { kind: 'Plus'; left: PatternExpr; right: PatternExpr }
  | { kind: 'Minus'; left: PatternExpr; right: PatternExpr }
  | { kind: 'Times'; left: PatternExpr; right: PatternExpr }
  | { kind: 'Frac'; num: PatternExpr; den: PatternExpr }
  | { kind: 'Pow'; base: PatternExpr; exponent: PatternExpr }
  | { kind: 'FnCall'; name: string; args: PatternExpr[] }; // <--- Added for general function patterns

export interface Identity {
  id: string;
  name: string;
  lhs: PatternExpr;
  rhs: PatternExpr;
}

// Map of matched wildcard variable names to actual AST nodes
export type Bindings = Record<string, Expr>;

/**
 * Registry of standard algebraic identities defined as AST patterns.
//  */
export const MATH_IDENTITIES: Identity[] = [
  defineIdentity(
    'foil',
    'FOIL Method: (A + B)(C + D) = AC + AD + BC + BD',
    '(A + B)(C + D) = AC + AD + BC + BD'
  ),

  defineIdentity(
    'distributive-right',
    'Right Distributive Property: AC + BC = (A + B)C',
    'AC + BC = (A + B)C'
  ),

  defineIdentity(
    'distributive-left',
    'Left Distributive Property: A(B + C) = AB + AC',
    'A(B + C) = AB + AC'
  ),

  defineIdentity(
    'commutative-times',
    'Commutative Property of Multiplication: XY = YX',
    'XY = YX'
  ),
  
  defineIdentity(
    'additive-identity',
    'Additive Identity: A + 0 = A',
    'A + 0 = A'
  ),

  defineIdentity(
  'commutative-plus',
  'Commutative Property of Addition: X + Y = Y + X',
  'X + Y = Y + X'
  ),

  defineIdentity(
    'associative-plus',
    'Associative Property of Addition: (A + B) + C = A + (B + C)',
    '(A + B) + C = A + (B + C)'
  ),
];
// export const MATH_IDENTITIES: Identity[] = [
//     {
//     id: 'foil',
//     name: 'FOIL Method: (A + B)(C + D) = AC + AD + BC + BD',
//     pattern: {
//       kind: 'Times',
//       left: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'A' },
//         right: { kind: 'Wildcard', name: 'B' },
//       },
//       right: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'C' },
//         right: { kind: 'Wildcard', name: 'D' },
//       },
//     },
//     result: {
//       kind: 'Plus',
//       left: {
//         kind: 'Plus',
//         left: {
//           kind: 'Plus',
//           left: {
//             kind: 'Times',
//             left: { kind: 'Wildcard', name: 'A' },
//             right: { kind: 'Wildcard', name: 'C' },
//           },
//           right: {
//             kind: 'Times',
//             left: { kind: 'Wildcard', name: 'A' },
//             right: { kind: 'Wildcard', name: 'D' },
//           },
//         },
//         right: {
//           kind: 'Times',
//           left: { kind: 'Wildcard', name: 'B' },
//           right: { kind: 'Wildcard', name: 'C' },
//         },
//       },
//       right: {
//         kind: 'Times',
//         left: { kind: 'Wildcard', name: 'B' },
//         right: { kind: 'Wildcard', name: 'D' },
//       },
//     },
//   },
//   {
//     id: 'distributive-right-r',
//     name: 'Right Distributive Property: AC + BC = (A + B)C',
//     pattern: {
//       kind: 'Plus',
//       left: { kind: 'Times', left: { kind: 'Wildcard', name: 'A' }, right: { kind: 'Wildcard', name: 'C' } },
//       right: { kind: 'Times', left: { kind: 'Wildcard', name: 'B' }, right: { kind: 'Wildcard', name: 'C' } },
//     },
//     result: {
//       kind: 'Times',
//       left: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'A' },
//         right: { kind: 'Wildcard', name: 'B' },
//       },
//       right: { kind: 'Wildcard', name: 'C' },
//     },
//   },
//   {
//     id: 'distributive-right-l',
//     name: 'Right Distributive Property: (A + B)C = AC + BC',
//     pattern: {
//       kind: 'Times',
//       left: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'A' },
//         right: { kind: 'Wildcard', name: 'B' },
//       },
//       right: { kind: 'Wildcard', name: 'C' },
//     },
//     result: {
//       kind: 'Plus',
//       left: { kind: 'Times', left: { kind: 'Wildcard', name: 'A' }, right: { kind: 'Wildcard', name: 'C' } },
//       right: { kind: 'Times', left: { kind: 'Wildcard', name: 'B' }, right: { kind: 'Wildcard', name: 'C' } },
//     },
//   },
//   {
//     id: 'distributive-left-l',
//     name: 'Left Distributive Property: A(B + C) = AB + AC',
//     pattern: {
//       kind: 'Times',
//       left: { kind: 'Wildcard', name: 'A' },
//       right: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'B' },
//         right: { kind: 'Wildcard', name: 'C' },
//       },
//     },
//     result: {
//       kind: 'Plus',
//       left: { kind: 'Times', left: { kind: 'Wildcard', name: 'A' }, right: { kind: 'Wildcard', name: 'B' } },
//       right: { kind: 'Times', left: { kind: 'Wildcard', name: 'A' }, right: { kind: 'Wildcard', name: 'C' } },
//     },
//   },
//   {
//     id: 'distributive-left-r',
//     name: 'Left Distributive Property: AB + AC = A(B + C)',
//     pattern: {
//               kind: 'Plus',
//       left: { kind: 'Times', left: { kind: 'Wildcard', name: 'A' }, right: { kind: 'Wildcard', name: 'B' } },
//       right: { kind: 'Times', left: { kind: 'Wildcard', name: 'A' }, right: { kind: 'Wildcard', name: 'C' } },
//     },
//     result: {
//       kind: 'Times',
//       left: { kind: 'Wildcard', name: 'A' },
//       right: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'B' },
//         right: { kind: 'Wildcard', name: 'C' },
//       },
//     },
//   },
//   {
//     id: 'commutative-times',
//     name: 'Commutative Property of Multiplication: XY = YX',
//     pattern: {
//       kind: 'Times',
//       left: { kind: 'Wildcard', name: 'X' },
//       right: { kind: 'Wildcard', name: 'Y' },
//     },
//     result: {
//       kind: 'Times',
//       left: { kind: 'Wildcard', name: 'Y' },
//       right: { kind: 'Wildcard', name: 'X' },
//     },
//   },
//   {
//     id: 'additive-identity',
//     name: 'Additive Identity: A + 0 = A',
//     pattern: {
//       kind: 'Plus',
//       left: { kind: 'Wildcard', name: 'A' },
//       right: { kind: 'Const', value: {type:'number', value: 0} },
//     },
//     result: { kind: 'Wildcard', name: 'A' },
//   },
//   {
//     id: 'associative-plus',
//     name: 'Associative Property of Addition: (A + B) + C = A + (B + C)',
//     pattern: {
//       kind: 'Plus',
//       left: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'A' },
//         right: { kind: 'Wildcard', name: 'B' },
//       },
//       right: { kind: 'Wildcard', name: 'C' },
//     },
//     result: {
//       kind: 'Plus',
//       left: { kind: 'Wildcard', name: 'A' },
//       right: {
//         kind: 'Plus',
//         left: { kind: 'Wildcard', name: 'B' },
//         right: { kind: 'Wildcard', name: 'C' },
//       },
//     },
//   },
// ];