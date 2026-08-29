/**
 * circuitKeybindings.js — Keyboard shortcut registry for Q-Circuit Studio
 */
import { useEffect } from 'react';
import { useCircuit } from './circuitStore';
import { getGateByShortcut } from '../data/gateDefinitions';

export const SHORTCUTS = [
  { key: 'V', desc: 'Select Tool' },
  { key: 'G', desc: 'Place Tool' },
  { key: 'E', desc: 'Erase Tool' },
  { key: 'Space', desc: 'Pan Tool (Hold)' },
  { key: 'Ctrl+Z', desc: 'Undo' },
  { key: 'Ctrl+Y', desc: 'Redo' },
  { key: 'Ctrl+K', desc: 'Command Palette' },
  { key: 'Del / Backspace', desc: 'Delete Selected' },
  { key: 'F', desc: 'Fit View to Screen' },
  { key: '?', desc: 'Toggle Shortcuts Help' },
  { key: 'A-Z', desc: 'Quick Place Gate (e.g. H for Hadamard)' },
];

export function useCircuitKeybindings() {
  const { state, dispatch } = useCircuit();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          dispatch({ type: e.shiftKey ? 'REDO' : 'UNDO' });
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          dispatch({ type: 'REDO' });
        } else if (e.key.toLowerCase() === 'k') {
          e.preventDefault();
          dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v': dispatch({ type: 'SET_TOOL', tool: 'select' }); break;
        case 'g': dispatch({ type: 'SET_TOOL', tool: 'place' }); break;
        case 'e': dispatch({ type: 'SET_TOOL', tool: 'erase' }); break;
        case ' ':
          e.preventDefault(); // prevent scroll
          dispatch({ type: 'SET_TOOL', tool: 'pan' });
          break;
        case 'f':
          dispatch({ type: 'FIT_VIEW' });
          break;
        case 'delete':
        case 'backspace':
          if (state.selection.length > 0) {
            dispatch({ type: 'DELETE_SELECTION' });
          }
          break;
        case '?':
          dispatch({ type: 'TOGGLE_SHORTCUTS_HELP' });
          break;
        case 'escape':
          if (state.selection.length > 0) {
            dispatch({ type: 'SET_SELECTION', selection: [] });
          }
          break;
        default:
          // Check for gate shortcut
          if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
            const gateDef = getGateByShortcut(e.key.toLowerCase());
            if (gateDef) {
              dispatch({ type: 'SET_TOOL', tool: 'place' });
              // Assuming there is a way to set the active gate for placement.
              // For now we might need to add it to the state or handle it via a toast.
              console.log(`Shortcut pressed for gate: ${gateDef.name}`);
            }
          }
          break;
      }
    };

    const handleKeyUp = (e) => {
      // If we wanted to revert from pan tool on space up, we could do it here,
      // but it might be confusing if they switched manually.
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.selection, dispatch]);
}
