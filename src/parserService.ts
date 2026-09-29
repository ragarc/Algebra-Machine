import type { Stage2Payload } from './types';
import { parseLatexToAST, toTaggedLatex } from './ast';

export function parseAndTag(rawLatex: string): Stage2Payload {
  const ast = parseLatexToAST(rawLatex);
  return toTaggedLatex(ast, rawLatex);
}