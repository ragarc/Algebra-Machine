export type ConstValue =
  | { type: 'number'; value: number }
  | { type: 'symbol'; symbol: string }; // e.g., '\pi', '\psi', '\phi', '\varphi'

export type Expr =
  | { kind: 'Const'; value: ConstValue }
  | { kind: 'Var'; name: string }
  | { kind: 'Plus'; left: Expr; right: Expr }
  | { kind: 'Minus'; left: Expr; right: Expr } // Binary subtraction
  | { kind: 'Neg'; term: Expr }               // Unary negation (e.g. -x)
  | { kind: 'Times'; left: Expr; right: Expr }
  | { kind: 'Frac'; num: Expr; den: Expr }
  | { kind: 'Pow'; base: Expr; exponent: Expr }
  | { kind: 'Sqrt'; term: Expr }
  | { kind: 'Sin'; term: Expr }
  | { kind: 'Cos'; term: Expr }
  | { kind: 'Exp'; term: Expr };

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