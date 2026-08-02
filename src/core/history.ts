export interface Command {
  label: string;
  do(): void;
  undo(): void;
}

/** Undo/redo command stack. `push` executes then records; `pushDone` records a
 *  command whose effect was already applied interactively (gizmo drags). */
export class History {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private limit = 100;
  onChange: (() => void) | null = null;

  push(cmd: Command): void {
    cmd.do();
    this.pushDone(cmd);
  }

  pushDone(cmd: Command): void {
    this.undoStack.push(cmd);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack.length = 0;
    this.onChange?.();
  }

  undo(): string | null {
    const cmd = this.undoStack.pop();
    if (!cmd) return null;
    cmd.undo();
    this.redoStack.push(cmd);
    this.onChange?.();
    return cmd.label;
  }

  redo(): string | null {
    const cmd = this.redoStack.pop();
    if (!cmd) return null;
    cmd.do();
    this.undoStack.push(cmd);
    this.onChange?.();
    return cmd.label;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.onChange?.();
  }

  static group(label: string, cmds: Command[]): Command {
    return {
      label,
      do() {
        for (const c of cmds) c.do();
      },
      undo() {
        for (let i = cmds.length - 1; i >= 0; i--) cmds[i].undo();
      }
    };
  }
}
