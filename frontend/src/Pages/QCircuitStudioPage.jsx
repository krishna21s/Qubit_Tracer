import React, { useState } from 'react';
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
import { useCircuitKeybindings } from '../lib/circuitKeybindings';
import '../styles/qcircuit.css';

function QCircuitStudioApp() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiOpen, setAiOpen]           = useState(false); // Future Phase 5
  const [propsOpen, setPropsOpen]     = useState(true);
  const [codeOpen, setCodeOpen]       = useState(false);

  // Initialize keybindings
  useCircuitKeybindings();

  return (
    <div className="qc-root">
      
      {/* Top Bar for circuit title and global actions */}
      <TopBar 
        propsOpen={propsOpen}
        onToggleProps={() => setPropsOpen(p => !p)}
        codeOpen={codeOpen}
        onToggleCode={() => setCodeOpen(c => !c)}
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

        {/* Central Canvas Area */}
        <div className="qc-canvas-container">
          <CircuitCanvas />
        </div>

        {/* Right-side Properties Panel */}
        <div className={`qc-props-panel ${!propsOpen ? 'closed' : ''}`}>
          {propsOpen && <PropertyPanel onClose={() => setPropsOpen(false)} />}
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
