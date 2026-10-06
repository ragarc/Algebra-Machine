// src/ast/tagger.ts
import { FUNCTION_REGISTRY } from '../types';
import type { Expr, ASTNodeData, Stage2Payload } from '../types';

export function toTaggedLatex(expr: Expr, rawLatex: string): Stage2Payload {
  let nextId = 0;
  const astTagMap: Record<string, ASTNodeData> = {};

  /**
   * Helper to check if an expression is an addition or subtraction
   */
  function isAdditive(node: Expr): boolean {
    return node.kind === 'Plus' || node.kind === 'Minus';
  }

  /**
   * Wraps generated LaTeX in parentheses if the AST node is Plus or Minus.
   */
  function wrapIfAdditive(node: Expr, latex: string): string {
    return isAdditive(node) ? `(${latex})` : latex;
  }

  function traverse(node: Expr): string {
    const id = (nextId++).toString();

    switch (node.kind) {
      case 'Const': {
        const valStr =
          node.value.type === 'number'
            ? node.value.value.toString()
            : node.value.symbol;

        astTagMap[id] = {
          kind: 'Const',
          label:
            node.value.type === 'number'
              ? `Constant ${valStr}`
              : `Symbolic Constant ${valStr}`,
          value: node.value,
          subExpr: node,
        };

        return `\\htmlData{node-id=${id}}{${valStr}}`;
      }
      case 'Var': {
        astTagMap[id] = {
          kind: 'Var',
          label: `Variable '${node.name}'`,
          name: node.name,
          subExpr: node,
        };
        return `\\htmlData{node-id=${id}}{${node.name}}`;
      }
      case 'Plus': {
        const l = traverse(node.left);
        const r = traverse(node.right);
        astTagMap[id] = { kind: 'Plus', label: 'Addition', subExpr: node };
        return `\\htmlData{node-id=${id}}{${l} + ${r}}`;
      }
      case 'Minus': {
        const l = traverse(node.left);
        const r = traverse(node.right);
        astTagMap[id] = { kind: 'Minus', label: 'Subtraction', subExpr: node };
        return `\\htmlData{node-id=${id}}{${l} - ${r}}`;
      }
      case 'Neg': {
        let body = traverse(node.term);
        // If negating an addition/subtraction, wrap in parentheses: -(a + b)
        if (isAdditive(node.term)) {
          body = `(${body})`;
        }
        astTagMap[id] = { kind: 'Neg', label: 'Negation', subExpr: node };
        return `\\htmlData{node-id=${id}}{-${body}}`;
      }
      case 'Times': {
        let l = traverse(node.left);
        let r = traverse(node.right);

        // Wrap left/right operands if they are additions or subtractions
        l = wrapIfAdditive(node.left, l);
        r = wrapIfAdditive(node.right, r);

        astTagMap[id] = { kind: 'Times', label: 'Multiplication', subExpr: node };

        // Insert \cdot if BOTH operands are numeric constants (e.g., 3 · 4)
        // const isLeftNumber =
        //   node.left.kind === 'Const' && node.left.value.type === 'number';
        const isRightNumber =
          node.right.kind === 'Const' && node.right.value.type === 'number';
        const needsDot = isRightNumber;

        const separator = needsDot ? ' \\cdot ' : '';

        return `\\htmlData{node-id=${id}}{${l}${separator}${r}}`;
      }
      case 'Frac': {
        // Numerator and denominator in \frac don't strictly need outer parens
        const num = traverse(node.num);
        const den = traverse(node.den);
        astTagMap[id] = { kind: 'Frac', label: 'Fraction', subExpr: node };
        return `\\htmlData{node-id=${id}}{\\frac{${num}}{${den}}}`;
      }
      case 'Pow': {
        let baseLatex = traverse(node.base);

        // Wrap base in parentheses if it's not a atomic Const or Var
        if (node.base.kind !== 'Const' && node.base.kind !== 'Var') {
          baseLatex = `(${baseLatex})`;
        }

        const exp = traverse(node.exponent);
        astTagMap[id] = { kind: 'Pow', label: 'Exponentiation', subExpr: node };
        return `\\htmlData{node-id=${id}}{${baseLatex}^{${exp}}}`;
      }
      case 'FnCall': {
  const spec = FUNCTION_REGISTRY[node.name];
  const renderedArgs = node.args.map((arg) => traverse(arg));

  // Determine LaTeX formatting based on function spec/name
  let latexStr: string;
  if (node.name === 'sqrt') {
    latexStr = `\\sqrt{${renderedArgs[0]}}`;
  } else if (node.name === 'exp') {
    latexStr = `e^{${renderedArgs[0]}}`;
  } else {
    const latexOp = spec?.latexName ?? `\\operatorname{${node.name}}`;
    latexStr = `${latexOp}(${renderedArgs.join(', ')})`;
  }

  // Capitalize name for UI label (e.g., 'sin' -> 'Sin Function')
  const labelName = node.name.charAt(0).toUpperCase() + node.name.slice(1);

  astTagMap[id] = {
    kind: 'FnCall',
    label: `${labelName} Function`,
    subExpr: node,
  };

  return `\\htmlData{node-id=${id}}{${latexStr}}`;
}
    }
  }

  const annotatedLatex = traverse(expr);

  return {
    rawLatex,
    annotatedLatex,
    astTagMap,
  };
}
