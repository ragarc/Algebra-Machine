import React, { useMemo } from 'react';
import type { Stage2Payload, Expr, ConstValue } from '../types';

interface AstTreeNodeProps {
  nodeId: string;
  payload: Stage2Payload;
  hoveredNodeId: string | null;
  onHoverNode: (id: string | null) => void;
}

function getChildNodes(expr: Expr): { label: string; node: Expr }[] {
  switch (expr.kind) {
    case 'Plus':
    case 'Minus':
    case 'Times':
      return [
        { label: 'left', node: expr.left },
        { label: 'right', node: expr.right },
      ];
    case 'Frac':
      return [
        { label: 'num', node: expr.num },
        { label: 'den', node: expr.den },
      ];
    case 'Pow':
      return [
        { label: 'base', node: expr.base },
        { label: 'exponent', node: expr.exponent },
      ];
    case 'Neg':
    case 'Sqrt':
    case 'Sin':
    case 'Cos':
    case 'Exp':
      return [{ label: 'term', node: expr.term }];
    case 'Const':
    case 'Var':
      return [];
  }
}

function getConstValueLabel(constVal: ConstValue): string {
  switch (constVal.type) {
    case 'number':
      return String(constVal.value);
    case 'symbol':
      return constVal.symbol;
  }
}

function getNodeDisplayLabel(expr: Expr): string {
  switch (expr.kind) {
    case 'Const':
      return getConstValueLabel(expr.value);
    case 'Var':
      return expr.name;
    case 'Plus':
      return '+';
    case 'Minus':
      return '-';
    case 'Neg':
      return '- (unary)';
    case 'Times':
      return '×';
    case 'Frac':
      return '÷';
    case 'Pow':
      return '^';
    case 'Sqrt':
      return '√';
    case 'Sin':
      return 'sin';
    case 'Cos':
      return 'cos';
    case 'Exp':
      return 'exp';
  }
}

export const AstTreeNode: React.FC<AstTreeNodeProps> = ({
  nodeId,
  payload,
  hoveredNodeId,
  onHoverNode,
}) => {
  const nodeData = payload.astTagMap[nodeId];
  if (!nodeData || !nodeData.subExpr) return null;

  const subExpr = nodeData.subExpr;
  const children = getChildNodes(subExpr);
  const isHovered = hoveredNodeId === nodeId;

  // Build an O(1) inverse lookup map from subExpr reference to nodeId
  const exprToIdMap = useMemo(() => {
    const map = new Map<Expr, string>();
    for (const [id, data] of Object.entries(payload.astTagMap)) {
      if (data.subExpr) {
        map.set(data.subExpr, id);
      }
    }
    return map;
  }, [payload.astTagMap]);

  const childNodeEntries = children.map(({ label, node }) => ({
    label,
    childId: exprToIdMap.get(node),
  }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 8px',
      }}
    >
      {/* Target Node Card - includes data-node-id for context menu & bidirectional highlight */}
      <div
        data-node-id={nodeId}
        onMouseEnter={(e) => {
          e.stopPropagation();
          onHoverNode(nodeId);
        }}
        onMouseLeave={() => onHoverNode(null)}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: `2px solid ${isHovered ? '#ffd700' : '#cccccc'}`,
          backgroundColor: isHovered ? 'rgba(255, 215, 0, 0.2)' : '#ffffff',
          fontWeight: 'bold',
          fontSize: '13px',
          color: '#333333',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: isHovered
            ? '0 0 8px rgba(255, 215, 0, 0.6)'
            : '0 1px 3px rgba(0,0,0,0.1)',
          userSelect: 'none',
        }}
      >
        {getNodeDisplayLabel(subExpr)}
      </div>

      {/* Tree Connectors & Children */}
      {childNodeEntries.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '4px',
          }}
        >
          {/* Vertical stem connecting parent to horizontal branch line */}
          <div style={{ width: '2px', height: '12px', backgroundColor: '#bbbbbb' }} />

          {/* Horizontal branch container */}
          <div
            style={{
              display: 'flex',
              position: 'relative',
              paddingTop: '4px',
              borderTop: childNodeEntries.length > 1 ? '2px solid #bbbbbb' : 'none',
            }}
          >
            {childNodeEntries.map(
              ({ label, childId }) =>
                childId && (
                  <div
                    key={childId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: '#777777', marginBottom: '2px' }}>
                      {label}
                    </span>
                    <AstTreeNode
                      nodeId={childId}
                      payload={payload}
                      hoveredNodeId={hoveredNodeId}
                      onHoverNode={onHoverNode}
                    />
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
