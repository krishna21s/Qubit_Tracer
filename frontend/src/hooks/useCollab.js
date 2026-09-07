/**
 * useCollab.js — Custom hook for real-time collaboration via WebSocket.
 *
 * Manages:
 *  - WebSocket connection lifecycle to /ws/collab/{circuitId}
 *  - Remote cursor state (positions + usernames + colors)
 *  - Participant list (who is in the room)
 *  - Broadcasting local circuit changes and cursor movement
 *  - Receiving remote circuit updates
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWsBaseUrl } from '../utils/api';

export default function useCollab(circuitId, options = {}) {
  const { onRemoteUpdate } = options;
  const { token } = useAuth();
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [initData, setInitData] = useState(null); // { user_id, username, color, is_owner, can_edit }
  const [remoteCircuitUpdate, setRemoteCircuitUpdate] = useState(null);

  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  onRemoteUpdateRef.current = onRemoteUpdate;

  // Throttle cursor sends (every 35ms max ~ 28fps)
  const lastCursorSend = useRef(0);

  const connect = useCallback(() => {
    if (!circuitId || !token) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = getWsBaseUrl();
    const ws = new WebSocket(`${wsUrl}/ws/collab/${circuitId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'init':
            setInitData(msg.data);
            if (msg.data && msg.data.circuit_data) {
              setRemoteCircuitUpdate(msg.data.circuit_data);
              if (onRemoteUpdateRef.current) {
                onRemoteUpdateRef.current(msg.data.circuit_data);
              }
            }
            break;
          case 'participants': {
            // Deduplicate participants by unique user_id
            const seen = new Set();
            const unique = (msg.data || []).filter(p => {
              if (!p || !p.user_id || seen.has(p.user_id)) return false;
              seen.add(p.user_id);
              return true;
            });
            setParticipants(unique);
            // Prune cursors of departed users
            const activeIds = new Set(unique.map(p => p.user_id));
            setRemoteCursors(prev => {
              const updated = {};
              for (const [uid, c] of Object.entries(prev)) {
                if (activeIds.has(Number(uid))) updated[uid] = c;
              }
              return updated;
            });
            break;
          }
          case 'cursor_move':
            setRemoteCursors(prev => {
              if (!msg.data || msg.data.x < 0 || msg.data.y < 0) {
                const copy = { ...prev };
                delete copy[msg.data?.user_id];
                return copy;
              }
              return {
                ...prev,
                [msg.data.user_id]: msg.data,
              };
            });
            break;
          case 'circuit_update':
            setRemoteCircuitUpdate(msg.data);
            if (onRemoteUpdateRef.current) {
              onRemoteUpdateRef.current(msg.data);
            }
            break;
          case 'ping':
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'pong' }));
            }
            break;
          case 'error':
            console.warn('[Collab] Server error:', msg.data);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('[Collab] Parse error:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      setParticipants([]);
      setRemoteCursors({});
      setInitData(null);
    };

    ws.onerror = (err) => {
      console.error('[Collab] WebSocket error:', err);
    };
  }, [circuitId, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, "User disconnected");
      } catch {}
      wsRef.current = null;
    }
    setConnected(false);
    setParticipants([]);
    setRemoteCursors({});
    setInitData(null);
  }, []);

  // Cleanup on unmount & on page unload / mobile tab backgrounding
  useEffect(() => {
    const handleUnload = () => {
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, "Window unloading");
        } catch {}
        wsRef.current = null;
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      handleUnload();
    };
  }, []);

  const broadcastCursor = useCallback((x, y) => {
    const now = Date.now();
    if (now - lastCursorSend.current < 35) return;
    lastCursorSend.current = now;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cursor_move', x, y }));
    }
  }, []);

  const broadcastCursorLeave = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cursor_move', x: -9999, y: -9999 }));
    }
  }, []);

  const broadcastCircuitUpdate = useCallback((circuitData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'circuit_update',
        data: circuitData,
      }));
    }
  }, []);

  // Clear remote circuit update after it's been consumed
  const clearRemoteUpdate = useCallback(() => {
    setRemoteCircuitUpdate(null);
  }, []);

  return {
    connected,
    participants,
    remoteCursors,
    initData,
    remoteCircuitUpdate,
    clearRemoteUpdate,
    connect,
    disconnect,
    broadcastCursor,
    broadcastCursorLeave,
    broadcastCircuitUpdate,
  };
}
