import type { Expr } from '../types';
import { lex } from './lexer';
import { Parser } from './parser';

export function parseLatexToAST(latex: string): Expr {
  const tokens = lex(latex);
  const parser = new Parser(tokens);
  return parser.parse();
}

export * from './lexer';
export * from './parser';
export * from './tagger'