// import { AST_METADATA } from '../types';

// interface NodeInspectorProps {
//   activeNodeId: string | null;
// }

// export function NodeInspector({ activeNodeId }: NodeInspectorProps) {
//   if (!activeNodeId) {
//     return <div id="node-info">Hover over a math component...</div>;
//   }

//   const data = AST_METADATA[activeNodeId];

//   return (
//     <div id="node-info">
//       <strong>Path:</strong> <code>{activeNodeId}</code> | {' '}
//       {data ? (
//         <>
//           <strong>Type:</strong> {data.type} | {' '}
//           <strong>Lean:</strong> <code>{data.leanExpr}</code>
//         </>
//       ) : (
//         <span>Unknown Node</span>
//       )}
//     </div>
//   );
// }