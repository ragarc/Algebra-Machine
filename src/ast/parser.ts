import { FUNCTION_REGISTRY } from '../types'; // Imported as a real value/object
import type { Expr } from '../types';             // Imported as a type only
import type { Token, TokenType } from './lexer';

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private advance(): Token {
    const token = this.peek();
    if (token.type !== 'EOF') this.current++;
    return token;
  }

  private match(type: TokenType): boolean {
    if (this.peek().type === type) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, message: string): Token {
    if (this.peek().type === type) {
      return this.advance();
    }
    throw new Error(`${message}. Got '${this.peek().value}' instead.`);
  }

  public parse(): Expr {
    const expr = this.parseExpression();
    if (this.peek().type !== 'EOF') {
      throw new Error(`Unexpected trailing token '${this.peek().value}'`);
    }
    return expr;
  }

  private parseExpression(): Expr {
    let expr = this.parseTerm();

    while (true) {
      if (this.match('PLUS')) {
        const right = this.parseTerm();
        expr = { kind: 'Plus', left: expr, right };
      } else if (this.match('MINUS')) {
        const right = this.parseTerm();
        expr = { kind: 'Minus', left: expr, right };
      } else {
        break;
      }
    }

    return expr;
  }

  // Term = Power ( ('*' | '\cdot' | implicit) Power )*
  private parseTerm(): Expr {
    let expr = this.parsePower();

    while (true) {
      if (this.match('TIMES')) {
        const right = this.parsePower();
        expr = { kind: 'Times', left: expr, right };
      } else if (this.isStartOfFactor(this.peek())) {
        const right = this.parsePower();
        expr = { kind: 'Times', left: expr, right };
      } else {
        break;
      }
    }

    return expr;
  }

  private isStartOfFactor(token: Token): boolean {
    return (
      token.type === 'NUMBER' ||
      token.type === 'SYMBOLIC_CONST' || // Included for implicit multiplication (e.g. 2\pi)
      token.type === 'VAR' ||
      token.type === 'COMMAND' ||
      token.type === 'LPAREN' ||
      token.type === 'LBRACE'
    );
  }

  // Power = Primary ( '^' ( '{' Expression '}' | Primary ) )?
  private parsePower(): Expr {
    const base = this.parsePrimary();

    if (this.match('CARET')) {
      let exponent: Expr;
      if (this.match('LBRACE')) {
        exponent = this.parseExpression();
        this.expect('RBRACE', "Expected '}' after exponent");
      } else {
        exponent = this.parsePrimary();
      }
      return { kind: 'Pow', base, exponent };
    }

    return base;
  }

  // Primary = Number | SymbolicConst | Var | UnaryMinus | FunctionCall | Frac | Block | Group
  private parsePrimary(): Expr {
    const token = this.peek();

    if (this.match('MINUS')) {
      const term = this.parsePrimary();
      return { kind: 'Neg', term };
    }

    if (this.match('NUMBER')) {
      return {
        kind: 'Const',
        value: { type: 'number', value: parseInt(token.value, 10) },
      };
    }

    if (this.match('SYMBOLIC_CONST')) {
      return {
        kind: 'Const',
        value: { type: 'symbol', symbol: token.value },
      };
    }

    if (this.match('VAR')) {
      return { kind: 'Var', name: token.value };
    }

    if (this.match('LPAREN')) {
      const expr = this.parseExpression();
      this.expect('RPAREN', "Expected ')'");
      return expr;
    }

    if (this.match('LBRACE')) {
      const expr = this.parseExpression();
      this.expect('RBRACE', "Expected '}'");
      return expr;
    }

    if (this.match('COMMAND')) {
      return this.parseCommand(token.value);
    }

    throw new Error(`Unexpected token '${token.value}'`);
  }

private parseCommand(cmd: string): Expr {
  // 1. Keep special structural commands that aren't generic function calls
  if (cmd === '\\frac') {
    this.expect('LBRACE', "Expected '{' for numerator");
    const num = this.parseExpression();
    this.expect('RBRACE', "Expected '}' after numerator");

    this.expect('LBRACE', "Expected '{' for denominator");
    const den = this.parseExpression();
    this.expect('RBRACE', "Expected '}' after denominator");

    return { kind: 'Frac', num, den };
  }

  // 2. Strip leading backslash (e.g. '\sinh' -> 'sinh')
  const funcName = cmd.startsWith('\\') ? cmd.slice(1) : cmd;

  // 3. Check if it exists in the function registry
  if (FUNCTION_REGISTRY[funcName]) {
    const term = this.parseArgumentBlock();
    return { kind: 'FnCall', name: funcName, args: [term] };
  }

  throw new Error(`Unsupported command '${cmd}'`);
}
  private parseArgumentBlock(): Expr {
    if (this.match('LBRACE')) {
      const expr = this.parseExpression();
      this.expect('RBRACE', "Expected '}'");
      return expr;
    }
    if (this.match('LPAREN')) {
      const expr = this.parseExpression();
      this.expect('RPAREN', "Expected ')'");
      return expr;
    }
    return this.parsePrimary();
  }
}