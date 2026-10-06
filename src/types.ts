export type ConstValue =
  | { type: 'number'; value: number }
  | { type: 'symbol'; symbol: string }; // e.g., '\pi', '\psi', '\phi', '\varphi'

export type Expr =
  | { kind: 'Const'; value: ConstValue }
  | { kind: 'Var'; name: string }
  | { kind: 'Plus'; left: Expr; right: Expr }
  | { kind: 'Minus'; left: Expr; right: Expr }
  | { kind: 'Neg'; term: Expr }
  | { kind: 'Times'; left: Expr; right: Expr }
  | { kind: 'Frac'; num: Expr; den: Expr }
  | { kind: 'Pow'; base: Expr; exponent: Expr }
  | { kind: 'FnCall'; name: string; args: Expr[] };

  export interface FunctionSpec {
  name: string;
  latexName?: string;
  arity: number;
  evaluate?: (...args: number[]) => number;
}

export const FUNCTION_REGISTRY: Record<string, FunctionSpec> = {
  sin:   { name: 'sin',   latexName: '\\sin',   arity: 1, evaluate: Math.sin },
  cos:   { name: 'cos',   latexName: '\\cos',   arity: 1, evaluate: Math.cos },
  tan:   { name: 'tan',   latexName: '\\tan',   arity: 1, evaluate: Math.tan },
  sinh:  { name: 'sinh',  latexName: '\\sinh',  arity: 1, evaluate: Math.sinh },
  cosh:  { name: 'cosh',  latexName: '\\cosh',  arity: 1, evaluate: Math.cosh },
  tanh:  { name: 'tanh',  latexName: '\\tanh',  arity: 1, evaluate: Math.tanh },
  sqrt:  { name: 'sqrt',  latexName: '\\sqrt',  arity: 1, evaluate: Math.sqrt },
  exp:   { name: 'exp',   latexName: 'e^',      arity: 1, evaluate: Math.exp },
  ln:    { name: 'ln',    latexName: '\\ln',    arity: 1, evaluate: Math.log },
  log:   { name: 'log',   latexName: '\\log',   arity: 1, evaluate: Math.log10 },
};

export interface ASTNodeData {
  kind: Expr['kind'];
  label: string;
  subExpr?: Expr;
  value?: ConstValue; // Updated to match the new ConstValue type
  name?: string;
}

export interface Stage2Payload {
  rawLatex: string;
  annotatedLatex: string;
  astTagMap: Record<string, ASTNodeData>;
}