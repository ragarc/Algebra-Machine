import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { Stage2Payload } from '../types';
import { AstTreeNode } from './AstTreeNode';
import { ContextMenu } from './ContextMenu';
import { useContextMenu } from '../hooks/useContextMenu';
import { PanelCard } from './PanelCard';
import { applyIdentity } from '../ast/rewriter';
import { toTaggedLatex } from '../ast/tagger';
import type { MatchResult } from '../ast/matcher';

interface RenderedViewProps {
  payload: Stage2Payload;
  onBack: () => void;
  onUpdatePayload: (newPayload: Stage2Payload) => void;
}

export const RenderedView: React.FC<RenderedViewProps> = ({
  payload,
  onBack,
  onUpdatePayload,
}) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu(payload);

  const renderAnnotatedKatex = () => {
    try {
      return {
        __html: katex.renderToString(payload.annotatedLatex, {
          throwOnError: false,
          displayMode: true,
          trust: true,
          strict: false,
        }),
      };
    } catch {
      return { __html: '<span style="color: red;">Failed to render tagged AST</span>' };
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-node-id]') as HTMLElement | null;
    if (target) {
      e.stopPropagation();
      setHoveredNodeId(target.getAttribute('data-node-id'));
    }
  };

  const handleMouseOut = () => {
    setHoveredNodeId(null);
  };

  const handleSelectIdentity = (match: MatchResult) => {
    if (!contextMenu) return;

    // 1. Get current root AST and target subtree node
    const rootExpr = payload.astTagMap['0']?.subExpr;
    const targetExpr = payload.astTagMap[contextMenu.nodeId]?.subExpr;

    if (!rootExpr || !targetExpr) return;

    // 2. Perform AST transformation
    const newRootExpr = applyIdentity(rootExpr, targetExpr, match);

    // 3. Re-tag the transformed AST to generate a fresh payload
    const newPayload = toTaggedLatex(newRootExpr, payload.rawLatex);

    // 4. Update state to re-render UI
    onUpdatePayload(newPayload);

    // 5. Close context menu
    closeContextMenu();
  };

  return (
    <div
      onClick={closeContextMenu}
      style={{ width: '100%', maxWidth: '1200px', margin: '20px auto', fontFamily: 'sans-serif' }}
    >
      <button
        onClick={onBack}
        style={{
          padding: '8px 16px',
          marginBottom: '20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '6px',
          border: '1px solid #ccc',
          backgroundColor: '#e0e0e0',
        }}
      >
        ← Edit Expression
      </button>

      {hoveredNodeId && (
        <style>{`
          [data-node-id="${hoveredNodeId}"] {
            outline: 2px solid #ffd700 !important;
            outline-offset: 2px;
            background-color: rgba(255, 215, 0, 0.15) !important;
          }
        `}</style>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
        {/* Left Side: KaTeX Formula */}
        <PanelCard title="Rendered Formula" contentStyle={{ alignItems: 'center' }}>
          <div
            onContextMenu={handleContextMenu}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            style={{ cursor: 'pointer', width: '100%', textAlign: 'center' }}
            dangerouslySetInnerHTML={renderAnnotatedKatex()}
          />
        </PanelCard>

        {/* Right Side: Graphical AST Tree */}
        <PanelCard title="AST Tree Representation" contentStyle={{ alignItems: 'flex-start' }}>
          <div
            onContextMenu={handleContextMenu}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <AstTreeNode
              nodeId="0"
              payload={payload}
              hoveredNodeId={hoveredNodeId}
              onHoverNode={setHoveredNodeId}
            />
          </div>
        </PanelCard>
      </div>

      {/* Floating Right-Click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          matches={contextMenu.matches}
          onSelectIdentity={handleSelectIdentity}
        />
      )}
    </div>
  );
};

export default RenderedView;
