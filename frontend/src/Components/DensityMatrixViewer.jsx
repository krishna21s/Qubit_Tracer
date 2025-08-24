import React from "react";

function DensityMatrixViewer({ matrices }) {
  if (!matrices || matrices.length === 0) {
    return (
      <div className="p-3 text-slate-400 text-sm">
        No density matrix data available
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/40 mt-3">
      <h3 className="text-slate-200 font-semibold text-sm mb-2">
        Density Matrices
      </h3>
      {matrices.map((matrix, idx) => (
        <div key={idx} className="mb-3">
          <div className="text-xs text-slate-400 mb-1">Qubit {idx}</div>
          <table className="w-full border-collapse text-xs text-slate-300">
            <tbody>
              {matrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((val, cIdx) => (
                    <td
                      key={cIdx}
                      className="border border-slate-600/40 px-2 py-1 text-center"
                    >
                      {Array.isArray(val)
                        ? `${val[0].toFixed(2)} + ${val[1].toFixed(2)}i`
                        : val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default DensityMatrixViewer;
