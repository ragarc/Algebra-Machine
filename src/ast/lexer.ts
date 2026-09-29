export type TokenType =
  | 'NUMBER'
  | 'SYMBOLIC_CONST' // Added for \pi, \psi, \phi, \varphi, e
  | 'VAR'
  | 'COMMAND'        // \frac, \sin, \cos, \sqrt, \exp
  | 'PLUS'
  | 'MINUS'
  | 'TIMES'
  | 'CARET'
  | 'LBRACE'         // {
  | 'RBRACE'         // }
  | 'LPAREN'         // (
  | 'RPAREN'         // )
  | 'EOF';

const SYMBOLIC_CONSTANTS = new Set(['\\pi', '\\psi', '\\phi', '\\varphi', '\\e']);

export interface Token {
  type: TokenType;
  value: string;
}

export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Numbers (integers)
    if (/[0-9]/.test(char)) {
      let numStr = '';
      while (i < input.length && /[0-9]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // LaTeX Commands (\frac, \sin, \cos, \sqrt, \cdot, \pi, etc.)
    if (char === '\\') {
      i++; // Skip backslash
      let cmd = '';
      while (i < input.length && /[a-zA-Z]/.test(input[i])) {
        cmd += input[i];
        i++;
      }
      const fullCmd = '\\' + cmd;

      if (cmd === 'cdot') {
        tokens.push({ type: 'TIMES', value: '\\cdot' });
      } else if (SYMBOLIC_CONSTANTS.has(fullCmd)) {
        tokens.push({ type: 'SYMBOLIC_CONST', value: fullCmd });
      } else {
        tokens.push({ type: 'COMMAND', value: fullCmd });
      }
      continue;
    }

    // Single-character variables
    if (/[a-zA-Z]/.test(char)) {
      tokens.push({ type: 'VAR', value: char });
      i++;
      continue;
    }

    // Operators & delimiters
    switch (char) {
      case '+': tokens.push({ type: 'PLUS', value: '+' }); break;
      case '-': tokens.push({ type: 'MINUS', value: '-' }); break;
      case '*': tokens.push({ type: 'TIMES', value: '*' }); break;
      case '^': tokens.push({ type: 'CARET', value: '^' }); break;
      case '{': tokens.push({ type: 'LBRACE', value: '{' }); break;
      case '}': tokens.push({ type: 'RBRACE', value: '}' }); break;
      case '(': tokens.push({ type: 'LPAREN', value: '(' }); break;
      case ')': tokens.push({ type: 'RPAREN', value: ')' }); break;
      default:
        throw new Error(`Unexpected character '${char}' at index ${i}`);
    }
    i++;
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}