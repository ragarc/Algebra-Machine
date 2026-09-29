// The design will be
// hovering over something will give us the iotion to click it. 
// once clicked, we will be able to visually see arrows coming out o the bottom, fanning out to display
// the possibilities in front of us. we select one of the possibilities, collapsing the
// fan and yielding an arrow downwards, labeled by the indicator for the arrow's type
// then we start over.

import { useState } from 'react';
import MathDisplay from './components/MathDisplay';
import RenderedView from './components/RenderedView';
import { type Stage2Payload } from './types';
import { parseAndTag } from './parserService';
// App.tsx

// ... rest of imports

function App() {
  const [stage, setStage] = useState<'editor' | 'rendered'>('editor');
  const [latex, setLatex] = useState<string>('\\frac{x^2}{2} + \\sin(x)');
  const [payload, setPayload] = useState<Stage2Payload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGo = () => {
    setIsLoading(true);
    try {
      const responsePayload = parseAndTag(latex);
      setPayload(responsePayload);
      setStage('rendered');
    } catch (err) {
      console.error('Parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEditor = () => {
    setStage('editor');
    setPayload(null);
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', width: '100vw', boxSizing: 'border-box', padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {stage === 'editor' ? (
          <MathDisplay
            latex={latex}
            onLatexChange={setLatex}
            onGo={handleGo}
            isLoading={isLoading}
          />
        ) : (
          payload && (
            <RenderedView
              payload={payload}
              onBack={handleBackToEditor}
              onUpdatePayload={(newPayload) => setPayload(newPayload)}
            />
          )
        )}
      </div>
    </div>
  );
}

export default App;