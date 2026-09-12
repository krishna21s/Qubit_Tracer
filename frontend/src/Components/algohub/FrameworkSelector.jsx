import React, { useState, useRef, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { FRAMEWORK_LIST, getFrameworkById } from "../../data/quantumFrameworks";
import "./FrameworkSelector.css";

export default function FrameworkSelector({
  selectedFramework = "qiskit",
  onSelectFramework,
  hasCustomChanges = false,
}) {
  const [open, setOpen] = useState(false);
  const [pendingFramework, setPendingFramework] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const rootRef = useRef(null);

  const current = getFrameworkById(selectedFramework);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  const handleSelect = (frameworkId) => {
    setOpen(false);
    if (frameworkId === selectedFramework) return;

    if (hasCustomChanges) {
      setPendingFramework(frameworkId);
      setConfirmDialogOpen(true);
    } else {
      onSelectFramework(frameworkId, true); // true = load default template
    }
  };

  const handleConfirmSwitchWithTemplate = () => {
    if (pendingFramework) {
      onSelectFramework(pendingFramework, true);
    }
    setConfirmDialogOpen(false);
    setPendingFramework(null);
  };

  const handleConfirmSwitchKeepCode = () => {
    if (pendingFramework) {
      onSelectFramework(pendingFramework, false); // false = keep current code
    }
    setConfirmDialogOpen(false);
    setPendingFramework(null);
  };

  return (
    <div className="framework-selector-root" ref={rootRef}>
      <button
        type="button"
        className="framework-pill-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Select Quantum Framework"
        title="Change framework / library environment"
      >
        <span
          className="framework-dot"
          style={{
            backgroundColor: current.badgeColor,
            color: current.badgeColor,
          }}
        />
        <span className="framework-name-text">{current.name}</span>
        <span className="framework-tag-badge">{current.tag}</span>
        <KeyboardArrowDownIcon
          className={`framework-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="framework-dropdown-menu">
          <div className="framework-menu-header">
            <span className="framework-menu-title">Select Framework / SDK</span>
          </div>

          {FRAMEWORK_LIST.map((fw) => {
            const isSelected = fw.id === selectedFramework;
            return (
              <div
                key={fw.id}
                className={`framework-item ${isSelected ? "active" : ""}`}
                onClick={() => handleSelect(fw.id)}
              >
                <div
                  className="framework-item-icon"
                  style={{ backgroundColor: fw.badgeColor }}
                />
                <div className="framework-item-content">
                  <div className="framework-item-row">
                    <span className="framework-item-title">{fw.name}</span>
                    <span
                      className="framework-item-badge"
                      style={{
                        backgroundColor: `${fw.badgeColor}22`,
                        color: fw.accentColor,
                      }}
                    >
                      {fw.tag}
                    </span>
                  </div>
                </div>
                {isSelected && <CheckIcon className="framework-check-icon" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal when switching with custom changes */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "#181c24",
            color: "#eff1f6",
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Switch Framework to{" "}
          <span style={{ color: pendingFramework ? getFrameworkById(pendingFramework).accentColor : "#fff" }}>
            {pendingFramework ? getFrameworkById(pendingFramework).name : ""}
          </span>
          ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            You have modified code in the editor. Would you like to load the starter template for{" "}
            <strong>{pendingFramework ? getFrameworkById(pendingFramework).name : ""}</strong> or keep your existing code?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleConfirmSwitchKeepCode}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "#eff1f6",
              "&:hover": { borderColor: "rgba(255, 255, 255, 0.4)" },
            }}
          >
            Keep My Code
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSwitchWithTemplate}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Load Starter Template
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
