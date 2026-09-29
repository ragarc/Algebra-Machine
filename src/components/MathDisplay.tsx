import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathDisplayProps {
  latex: string;
  onLatexChange: (val: string) => void;
  onGo: () => void;
  isLoading?: boolean;
}

export const MathDisplay: React.FC<MathDisplayProps> = ({
  latex,
  onLatexChange,
  onGo,
  isLoading,
}) => {
  const renderKatex = (input: string) => {
    try {
      return {
        __html: katex.renderToString(input || '\\text{ }', {
          throwOnError: false,
          displayMode: true,
        }),
      };
    } catch {
      return { __html: '<span style="color: red;">Invalid LaTeX</span>' };
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      {/* Top Box: User Input */}
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        LaTeX Input:
      </label>
      <textarea
        value={latex}
        onChange={(e) => onLatexChange(e.target.value)}
        placeholder="Type LaTeX here..."
        rows={4}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '16px',
          fontFamily: 'monospace',
          backgroundColor: '#ffffff',
          color: '#000000',
          boxSizing: 'border-box',
        }}
      />

      {/* Lower Box: What LaTeX sees */}
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Rendered Output:
        </label>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            minHeight: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
          dangerouslySetInnerHTML={renderKatex(latex)}
        />
      </div>

      {/* Action Button */}
      <button
        onClick={onGo}
        disabled={isLoading}
        style={{
          marginTop: '24px',
          width: '100%',
          padding: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: isLoading ? '#888888' : '#0066cc',
          border: 'none',
          borderRadius: '6px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Processing...' : 'GO!'}
      </button>
    </div>
  );
};

export default MathDisplay;