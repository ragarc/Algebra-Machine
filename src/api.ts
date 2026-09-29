// src/api.ts
import { type Stage2Payload } from './types';

export async function processLatexWithLean(rawLatex: string): Promise<Stage2Payload> {
  console.log('[Frontend API] Sending request to express bridge on http://localhost:8080/api...');
  console.log('[Frontend API] Payload sent:', { latex: rawLatex });

  try {
    const response = await fetch('http://localhost:8080/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latex: rawLatex }),
    });

    console.log('[Frontend API] Express server response HTTP status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Frontend API] Express returned an error:', errorText);
      throw new Error(`Server error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('[Frontend API] Payload received successfully from Lean:', data);

    return {
      rawLatex,
      annotatedLatex: data.annotatedLatex,
      astTagMap: data.astTagMap,
    };
  } catch (err) {
    console.error('[Frontend API] Network/Processing Error:', err);
    throw err;
  }
}