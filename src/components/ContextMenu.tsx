import React from 'react';
import type { MatchResult } from '../ast/matcher';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  matches: MatchResult[];
  onSelectIdentity: (match: MatchResult) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  nodeId,
  matches,
  onSelectIdentity,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #ccc',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        minWidth: '220px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #eee',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#666',
        }}
      >
        Applicable Identities (Node #{nodeId})
      </div>
      {matches.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {matches.map((match) => (
            <li
              key={match.identity.id}
              onClick={() => onSelectIdentity(match)}
              style={{
                padding: '10px 12px',
                fontSize: '13px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f7ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              {match.identity.name}
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ padding: '12px', fontSize: '13px', color: '#888' }}>
          No applicable identities for this node.
        </div>
      )}
    </div>
  );
};