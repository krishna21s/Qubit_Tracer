import React from 'react';

/**
 * A React component to inspect the results of a quantum circuit simulation.
 * It displays the OpenQASM code, Bloch vectors, and density matrices.
 * @param {object} props - The component props.
 * @param {object} props.result - The simulation result object.
 */
export default function Inspector({ result }) {
  // If there's no result yet, display a placeholder message.
  if (!result) {
    return <div style={{ color: '#9fb4c8' }}>No simulation yet. Use the left panel to run a circuit.</div>;
  }

  const vectors = result.bloch_vectors || [];

  /**
   * Formats a value from the density matrix for display.
   * Handles complex numbers (as arrays), real numbers, and numbers as strings.
   * @param {*} val - The value to format.
   * @returns {string} The formatted value as a string.
   */
  const formatMatrixValue = (val) => {
    // Case 1: Value is a complex number represented as an array [real, imaginary].
    if (Array.isArray(val) && val.length === 2) {
      const realPart = Number(val[0]).toFixed(2);
      const imagPart = Number(val[1]);

      // If the imaginary part is negligible, just show the real part.
      if (Math.abs(imagPart) < 1e-9) {
        return realPart;
      }

      // Format with a clean sign for the imaginary part.
      return `${realPart} ${imagPart < 0 ? '-' : '+'} ${Math.abs(imagPart).toFixed(2)}i`;
    }

    // Case 2: Value is not an array. Attempt to treat it as a number.
    // This will handle both actual numbers and numbers represented as strings.
    const num = Number(val);
    if (!isNaN(num)) {
      return num.toFixed(2);
    }

    // Fallback for any other unexpected data types.
    return 'N/A';
  };

  return (
    <div>
      <h3 style={{ marginTop: 0, color: '#cfefff' }}>Inspector</h3>
      <div style={{ fontSize: 13, color: '#9fb4c8' }}>OpenQASM</div>
      <div className="pre">{result.openqasm}</div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, color: '#9fb4c8' }}>Bloch vectors</div>
        {/* Using a pre-formatted tag to display the JSON nicely */}
        <pre className="pre">{JSON.stringify(vectors, null, 2)}</pre>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, color: '#9fb4c8' }}>Density Matrices</div>
        {result.density_matrices && result.density_matrices.length > 0 ? (
          result.density_matrices.map((matrix, idx) => (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#cfefff', marginBottom: 4 }}>
                Qubit {idx}
              </div>
              <table style={{ borderCollapse: 'collapse', fontSize: 12, color: '#cfefff' }}>
                <tbody>
                  {matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((val, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            border: '1px solid #3a4a5a',
                            padding: '4px 6px',
                            textAlign: 'center'
                          }}
                        >
                          {/* Use the robust formatting function */}
                          {formatMatrixValue(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div style={{ color: '#7fb5d9', fontSize: 12 }}>No density matrices available</div>
        )}
      </div>
    </div>
  );
}
