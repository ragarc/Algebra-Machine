import React from 'react';

interface PanelCardProps {
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

const baseCardStyle: React.CSSProperties = {
  padding: '20px',
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  minHeight: '200px',
  display: 'flex',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  overflowX: 'auto',
};

export const PanelCard: React.FC<PanelCardProps> = ({
  title,
  children,
  style,
  contentStyle,
}) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', ...style }}>
      <h3 style={{ fontSize: '16px', color: '#333', marginBottom: '8px' }}>
        {title}
      </h3>
      <div style={{ ...baseCardStyle, ...contentStyle }}>
        {children}
      </div>
    </div>
  );
};