import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CircuitProvider } from '../lib/circuitStore';
import CircuitCanvas from '../Components/qcircuit/CircuitCanvas';
import GatePalette from '../Components/qcircuit/GatePalette';
import PrimaryToolbar from '../Components/qcircuit/PrimaryToolbar';
import AIChatPanel from '../Components/qcircuit/AIChatPanel';
import TopBar from '../Components/qcircuit/TopBar';
import PropertyPanel from '../Components/qcircuit/PropertyPanel';
import ShortcutsHelp from '../Components/qcircuit/ShortcutsHelp';
import CodePanel from '../Components/qcircuit/CodePanel';
import ResultsDock from '../Components/qcircuit/ResultsDock';
import CommandPalette from '../Components/qcircuit/CommandPalette';
import CollaborateDialog from '../Components/qcircuit/CollaborateDialog';
import { useCircuitKeybindings } from '../lib/circuitKeybindings';
import { useCircuit } from '../lib/circuitStore';
import useCollab from '../hooks/useCollab';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../utils/api';
import '../styles/qcircuit.css';

function QCircuitStudioApp() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen]           = useState(false);
  const [propsOpen, setPropsOpen]     = useState(true);
  const [codeOpen, setCodeOpen]       = useState(false);
  const [collabDialogOpen, setCollabDialogOpen] = useState(false);
  const [savedCircuitId, setSavedCircuitId] = useState(null);

  const { state, dispatch } = useCircuit();
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get('room');

  // Initialize keybindings
  useCircuitKeybindings();

  // Callback for when remote circuit update arrives via WebSocket
  const handleRemoteUpdate = useCallback((payload) => {
    let parsed = payload;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) {}
    }
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) {}
    }
    if (parsed && (Array.isArray(parsed.gates) || parsed.qubits)) {
      dispatch({ type: 'SYNC_STATE', payload: parsed, source: 'remote' });
    }
  }, [dispatch]);

  // Collab hook with direct sync callback
  const collab = useCollab(roomId ? parseInt(roomId) : savedCircuitId, {
    onRemoteUpdate: handleRemoteUpdate,
  });

  // Auto-connect if room param is present
  useEffect(() => {
    if (roomId && token && !collab.connected) {
      collab.connect();
    }
  }, [roomId, token, collab.connected, collab.connect]);

  // Connect once we have a saved circuit ID
  useEffect(() => {
    if (savedCircuitId && token && !collab.connected) {
      collab.connect();
    }
  }, [savedCircuitId, token, collab.connected, collab.connect]);

  // Also fetch initial circuit from REST API when entering with room param as fallback
  useEffect(() => {
    if (roomId && token) {
      const API_URL = getApiBaseUrl();
      fetch(`${API_URL}/circuits/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.data) {
            try {
              let parsed = data.data;
              if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) {}
              }
              if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); } catch (e) {}
              }
              if (parsed && (Array.isArray(parsed.gates) || parsed.qubits)) {
                dispatch({
                  type: 'SYNC_STATE',
                  payload: parsed,
                  source: 'remote',
                });
              }
            } catch (e) {
              console.error('Failed to parse initial circuit:', e);
            }
          }
        })
        .catch(err => console.error('Failed to load shared circuit:', err));
    }
  }, [roomId, token, dispatch]);

  // Broadcast ONLY genuine local changes to peers (zero echo, zero infinite loop!)
  const prevVersionRef = useRef(state.version);
  useEffect(() => {
    if (!collab.connected) return;
    if (state.version === prevVersionRef.current) return;
    prevVersionRef.current = state.version;

    // Only broadcast if the state change was initiated locally (prevents echo back to peers)
    if (state.lastActionSource === 'local') {
      collab.broadcastCircuitUpdate({
        gates: state.gates,
        qubits: state.qubits,
        timeSteps: state.timeSteps,
        circuitName: state.circuitName,
      });
    }
  }, [state.version, state.lastActionSource, state.gates, state.qubits, state.timeSteps, state.circuitName, collab.connected, collab.broadcastCircuitUpdate]);

  // Handle collaborate button click
  const handleToggleCollab = async () => {
    if (collab.connected) {
      // Already connected — just toggle dialog
      setCollabDialogOpen(o => !o);
      return;
    }

    // Need to save circuit first to get an ID
    if (!savedCircuitId) {
      const API_URL = getApiBaseUrl();
      try {
        const circuitData = JSON.stringify({
          gates: state.gates,
          qubits: state.qubits,
        });
        const response = await fetch(`${API_URL}/circuits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: state.circuitName || 'Collaborative Circuit',
            data: circuitData
          })
        });
        if (response.ok) {
          const saved = await response.json();
          setSavedCircuitId(saved.id);
          // Set access to public edit so the shared link works immediately for peers
          await fetch(`${API_URL}/circuits/${saved.id}/share`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              is_public: true,
              access_level: 'edit',
            })
          }).catch(() => {});
          // Update URL with room param
          setSearchParams({ room: saved.id });
        } else {
          alert('Please save your circuit first before collaborating.');
          return;
        }
      } catch (err) {
        console.error(err);
        alert('Failed to prepare circuit for collaboration.');
        return;
      }
    }

    setCollabDialogOpen(true);
  };

  // Connect once we have a circuit ID
  useEffect(() => {
    if (savedCircuitId && token && !collab.connected) {
      collab.connect();
    }
  }, [savedCircuitId, token]);

  // Enforce read-only for spectators
  useEffect(() => {
    if (collab.initData && !collab.initData.can_edit) {
      dispatch({ type: 'SET_READ_ONLY', readOnly: true });
    } else if (collab.initData && collab.initData.can_edit) {
      dispatch({ type: 'SET_READ_ONLY', readOnly: false });
    }
  }, [collab.initData]);

  return (
    <div className="qc-root" style={{ position: 'relative', height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
      
      {/* Top Bar for circuit title and global actions */}
      <TopBar 
        propsOpen={propsOpen}
        onToggleProps={() => setPropsOpen(p => !p)}
        codeOpen={codeOpen}
        onToggleCode={() => setCodeOpen(c => !c)}
        onToggleCollab={handleToggleCollab}
        collabParticipants={collab.participants}
        collabConnected={collab.connected}
      />
      
      {/* Main horizontal workspace */}
      <div className="qc-workspace">
        
        {/* Left-most slim toolbar */}
        <PrimaryToolbar 
          paletteOpen={paletteOpen}
          onTogglePalette={() => {
            setPaletteOpen(p => !p);
            if (aiOpen) setAiOpen(false);
          }}
          aiOpen={aiOpen}
          onToggleAI={() => {
            setAiOpen(a => !a);
            if (paletteOpen) setPaletteOpen(false);
          }}
        />
        
        {/* Sliding flex panel (Gate Palette) */}
        <div className={`qc-palette-drawer ${!paletteOpen ? 'closed' : ''}`}>
          <GatePalette onClose={() => setPaletteOpen(false)} />
        </div>

        {/* AI Chat Drawer */}
        <AIChatPanel 
          open={aiOpen} 
          onClose={() => setAiOpen(false)} 
          onOpenCode={() => setCodeOpen(true)}
        />

        {/* Central Canvas Area — grows to fill all remaining space */}
        <div 
          className="qc-canvas-container" 
          style={{ position: 'relative' }}
        >
          <CircuitCanvas 
            remoteCursors={collab.remoteCursors}
            onCursorMove={(x, y) => {
              if (collab.connected) {
                collab.broadcastCursor(x, y);
              }
            }}
            onCursorLeave={() => {
              if (collab.connected) {
                collab.broadcastCursorLeave();
              }
            }}
            myUserId={user?.id ?? collab.initData?.user_id}
          />

          {/* Properties Panel — floats over canvas as absolute overlay */}
          <div className={`qc-props-panel ${!propsOpen ? 'closed' : ''}`}>
            {propsOpen && <PropertyPanel onClose={() => setPropsOpen(false)} />}
          </div>
        </div>

        {/* Right-side Code Panel */}
        <div className={`qc-code-drawer ${!codeOpen ? 'closed' : ''}`}>
          <CodePanel open={codeOpen} onClose={() => setCodeOpen(false)} />
        </div>
      </div>

      {/* Overlays / Drawers */}
      <ResultsDock />
      <CommandPalette />
      <ShortcutsHelp />

      {/* Collaborate Dialog */}
      <CollaborateDialog
        open={collabDialogOpen}
        onClose={() => setCollabDialogOpen(false)}
        circuitId={savedCircuitId || (roomId ? parseInt(roomId) : null)}
        participants={collab.participants}
        isOwner={collab.initData?.is_owner ?? true}
      />

      {/* Read-only overlay for spectators */}
      {state.readOnly && collab.connected && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 152, 0, 0.9)',
          color: '#fff',
          padding: '6px 20px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          👁 View Only — You are spectating this circuit
        </div>
      )}
    </div>
  );
}

export default function QCircuitStudioContent() {
  return (
    <CircuitProvider>
      <QCircuitStudioApp />
    </CircuitProvider>
  );
}
