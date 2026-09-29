import { useState } from 'react';
import type { Stage2Payload } from '../types';
import { findMatchingIdentities, type MatchResult } from '../ast/matcher';

export interface ContextMenuState {
  x: number;
  y: number;
  nodeId: string;
  matches: MatchResult[];
}

export function useContextMenu(payload: Stage2Payload) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-node-id]') as HTMLElement | null;
    if (target) {
      e.preventDefault();
      e.stopPropagation();

      const nodeId = target.getAttribute('data-node-id');
      if (!nodeId) return;

      const nodeData = payload.astTagMap[nodeId];

      if (nodeData?.subExpr) {
        const matches = findMatchingIdentities(nodeData.subExpr);
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
          nodeId,
          matches,
        });
      }
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
  };
}