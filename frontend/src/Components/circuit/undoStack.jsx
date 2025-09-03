export function createUndoStack(limit = 100) {
  return {
    past: [],
    future: [],
    limit,
    push(state) {
      this.past.push(state);
      if (this.past.length > this.limit) this.past.shift();
      this.future = [];
    },
    canUndo() { return this.past.length > 1; },
    canRedo() { return this.future.length > 0; },
    undo(current) {
      if (!this.canUndo()) return current;
      const prev = this.past[this.past.length - 2];
      const last = this.past.pop();
      this.future.unshift(last);
      return prev;
    },
    redo(current) {
      if (!this.canRedo()) return current;
      const next = this.future.shift();
      this.past.push(next);
      return next;
    }
  };
}