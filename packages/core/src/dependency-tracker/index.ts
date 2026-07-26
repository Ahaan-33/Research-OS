// Realizes Subsystem 9, minimally, per Reference Implementation Strategy §7:
// "even a naive 'mark everything dirty' implementation is legal per its own
// contract and can be sharpened to true locality later without an interface
// change." register()/notify() below is that later-sharpenable interface;
// the body is deliberately coarse for v0.
import type { ChangeSet, ElementId } from '../types';

export class DependencyTracker {
  private dirty = true; // start dirty: nothing has been computed yet

  register(_artifactId: string, _dependsOn: ChangeSet): void {
    // v0: no per-artifact bookkeeping. A real implementation intersects
    // `_dependsOn` against `notify`'s delta; see [[13-Runtime-Architecture]] §4.
  }

  notify(_delta: ChangeSet, _causedBy: ElementId): void {
    this.dirty = true;
  }

  isDirty(_artifactId?: string): boolean {
    return this.dirty;
  }

  clear(_artifactId?: string): void {
    this.dirty = false;
  }
}
