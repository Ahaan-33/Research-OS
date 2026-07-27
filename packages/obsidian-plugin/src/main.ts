// Realizes Subsystem 8 (Visualization Layer) and the UI-facing half of
// Subsystem 10 (Event Processing), per Reference Implementation Strategy §7.
// Per ADR-0002/§2: ResearchState lives in this plugin's own SQLite file
// inside its data directory — NEVER as vault-visible .md files. The vault's
// markdown is Projection output only (rendered on demand), never live state.
import { App, ItemView, Modal, Notice, Plugin, Setting, WorkspaceLeaf } from 'obsidian';
import * as path from 'node:path';
import {
  openStore, closeStore, getElement, getCoordinate, TransformationEngine, DependencyTracker,
  registerDimension, renderProjection, attribute, joint,
  type Store, type ProjectionOperator,
} from '@ros/core';

const VIEW_TYPE_ROS_PROJECTION = 'ros-projection-view';

/** Raw, per-field string state from the Capture form. Blank string means
 *  "researcher left this unset" — never coerced to a default or inferred. */
interface CapturedProperties {
  thread: string;
  stage: string;
  confidence: string;
  positivity: string;
}

/** Blank => undefined (no coordinate written; D14 absence is legal).
 *  'confidence' is the only non-string-valued dimension among the four, so
 *  it is the only one needing numeric coercion before Interpret. An
 *  unparseable number is passed through as NaN deliberately, not silently
 *  dropped — validateValue (E2) rejects it and the researcher sees why. */
function coerceValue(dimension: string, raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;
  if (dimension === 'confidence') return Number(trimmed);
  return trimmed;
}

export default class ResearchOperatingSystemPlugin extends Plugin {
  private store!: Store;
  private engine!: TransformationEngine;

  async onload(): Promise<void> {
    const vaultBasePath = (this.app.vault.adapter as unknown as { basePath: string }).basePath ?? '.';
    const pluginDir = path.join(vaultBasePath, this.manifest.dir ?? '.obsidian/plugins/ros');
    const dbPath = path.join(pluginDir, 'state.sqlite');
    // ADR-0007: better-sqlite3's own bindings()-based auto-resolution walks
    // the call stack to find the native .node file, which breaks once
    // everything is collapsed into a single bundled main.js. Supplying the
    // path explicitly skips that broken resolution entirely.
    const nativeBindingPath = path.join(pluginDir, 'better_sqlite3.node');
    // ADR-0008: __dirname inside the bundled main.js is not a reliable
    // stand-in for the plugin's install directory in every host context
    // (it was observed resolving into Obsidian/Electron's own asar, not
    // the plugin folder). Reuse the same vault-relative pluginDir already
    // proven correct for nativeBindingPath above, instead of letting
    // db.ts fall back to __dirname.
    const migrationsDir = path.join(pluginDir, 'migrations');
    this.store = openStore(dbPath, nativeBindingPath, migrationsDir);
    this.engine = new TransformationEngine(this.store, new DependencyTracker());

    // Bootstrap the Contextual Property dimensions the v0 capture workflow
    // collects. These are the canonical example set used throughout the
    // spec (thread/stage/confidence/positivity — see [[15-Canonical-Data-Model]]
    // Open Question 1) — chosen here as the smallest set that meaningfully
    // positions a captured object in the semantic space, not an exhaustive
    // metadata schema. Each is optional at capture time (D14: absent is legal).
    const initAct = joint([attribute('capture', 'plugin-init')]);
    registerDimension(this.store, {
      dimension: 'thread', valueSpace: { kind: 'freeText' },
      registeredAt: Date.now(), registeredBy: initAct,
    });
    registerDimension(this.store, {
      dimension: 'stage',
      valueSpace: { kind: 'enum', values: ['planning', 'in_progress', 'analysis', 'complete'] },
      registeredAt: Date.now(), registeredBy: initAct,
    });
    registerDimension(this.store, {
      dimension: 'confidence', valueSpace: { kind: 'scalar', min: 0, max: 1 },
      registeredAt: Date.now(), registeredBy: initAct,
    });
    registerDimension(this.store, {
      dimension: 'positivity',
      valueSpace: { kind: 'enum', values: ['positive', 'negative', 'mixed', 'inconclusive'] },
      registeredAt: Date.now(), registeredBy: initAct,
    });

    this.registerView(VIEW_TYPE_ROS_PROJECTION, (leaf) => new ProjectionView(leaf, this.store));

    this.addRibbonIcon('plus-circle', 'ROS: Capture note', () =>
      new CaptureModal(this.app, (text, properties) => this.handleCapture(text, properties)).open());

    this.addCommand({
      id: 'ros-capture',
      name: 'ROS: Capture note',
      callback: () => new CaptureModal(this.app, (text, properties) => this.handleCapture(text, properties)).open(),
    });

    this.addCommand({
      id: 'ros-render-thread-view',
      name: 'ROS: Open Thread View',
      callback: () => this.activateView('thread_view'),
    });

    this.addCommand({
      id: 'ros-render-timeline',
      name: 'ROS: Open Timeline',
      callback: () => this.activateView('timeline'),
    });
  }

  onunload(): void {
    // Per [[13-Runtime-Architecture]] §11: no researcher-facing shutdown
    // procedure is required; every acknowledged write is already durable.
    // Closing the handle here is a resource-cleanliness courtesy, not a
    // correctness requirement.
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_ROS_PROJECTION);
    if (this.store) closeStore(this.store);
  }

  private handleCapture(text: string, properties: CapturedProperties): void {
    // Note Block (free-form, uninterpreted) + Contextual Properties
    // (researcher-supplied, positions the note in semantic space) are
    // captured as one interaction but committed as one generator
    // application (Capture, G1) followed by one Interpret (G3) per
    // supplied property — per the design clarification referenced above.
    // Each property is independently optional (D14: absent is legal) and
    // independently committed, so one rejected property never discards the
    // Note Block or the other properties.
    const res = this.engine.capture({ text }, 'observation');
    if (!res.ok) {
      new Notice(`Capture rejected: ${res.error.code}`);
      return;
    }
    const rejected: string[] = [];
    for (const [dimension, raw] of Object.entries(properties)) {
      const value = coerceValue(dimension, raw);
      if (value === undefined) continue; // left blank — legal, no coordinate written
      const interp = this.engine.interpret(res.value, dimension, value);
      if (!interp.ok) rejected.push(dimension);
    }
    if (rejected.length > 0) {
      new Notice(`Captured, but rejected: ${rejected.join(', ')}.`);
    } else {
      new Notice(properties.thread?.trim() ? `Captured to thread "${properties.thread.trim()}".` : 'Captured.');
    }
    this.refreshOpenViews();
  }

  private async activateView(operator: ProjectionOperator): Promise<void> {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_ROS_PROJECTION)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_ROS_PROJECTION, active: true });
    }
    workspace.revealLeaf(leaf);
    (leaf.view as ProjectionView).setOperator(operator);
  }

  private refreshOpenViews(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_ROS_PROJECTION)) {
      (leaf.view as ProjectionView).refresh();
    }
  }
}

/** Renders a Thread View or Timeline as an actual Obsidian pane (a list of
 *  captured Note Blocks), replacing the earlier Notice-count placeholder.
 *  Still v0-minimal per Doc17 §7: no Markdown rendering of payload content,
 *  no per-entry navigation — just enough to make Capture/Interpret/render
 *  visibly verifiable inside a real Obsidian shell. */
class ProjectionView extends ItemView {
  private operator: ProjectionOperator = 'timeline';

  constructor(leaf: WorkspaceLeaf, private readonly store: Store) {
    super(leaf);
  }

  getViewType(): string { return VIEW_TYPE_ROS_PROJECTION; }
  getDisplayText(): string { return this.operator === 'thread_view' ? 'ROS Thread View' : 'ROS Timeline'; }
  getIcon(): string { return 'list'; }

  async onOpen(): Promise<void> {
    this.refresh();
  }

  setOperator(operator: ProjectionOperator): void {
    this.operator = operator;
    this.refresh();
  }

  refresh(): void {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl('h4', { text: this.getDisplayText() });

    const view = renderProjection(this.store, { operator: this.operator, parameters: {} });
    const content = view.content as { element: string; conflicted: boolean }[];

    if (content.length === 0) {
      container.createEl('p', {
        text: this.operator === 'thread_view'
          ? 'No elements yet. Capture a note with a thread set to see it here.'
          : 'No elements captured yet.',
        cls: 'ros-empty-state',
      });
      return;
    }

    if (this.operator === 'thread_view') {
      // Group by the actual thread value(s) — the point of a Thread View is
      // to organize by thread, not just to filter to "has a thread set"
      // (that filtered-but-flat rendering was indistinguishable from
      // Timeline). An element with a conflicted thread coordinate (>=2
      // recorded values) is listed under each value it holds, per D13 — a
      // conflict is never resolved by picking one value to display.
      const groups = new Map<string, { element: string; conflicted: boolean }[]>();
      for (const entry of content) {
        const coord = getCoordinate(this.store, entry.element, 'thread');
        const values = coord && coord.values.length > 0 ? coord.values.map((v) => String(v.value)) : ['(unset)'];
        for (const v of values) {
          if (!groups.has(v)) groups.set(v, []);
          groups.get(v)!.push(entry);
        }
      }
      for (const [thread, entries] of groups) {
        container.createEl('h6', { text: thread });
        const list = container.createEl('ul');
        for (const entry of entries) this.renderEntry(list, entry);
      }
      return;
    }

    const list = container.createEl('ul');
    for (const entry of content) this.renderEntry(list, entry);
  }

  /** One clickable line per note: preview text, conflict marker, opens
   *  NoteDetailModal for the full text and all four Contextual Properties. */
  private renderEntry(list: HTMLElement, entry: { element: string; conflicted: boolean }): void {
    const el = getElement(this.store, entry.element);
    const payload = el && el.role === 'content' ? (el.payload as { text?: string } | null) : null;
    const text = payload && typeof payload.text === 'string' && payload.text.length > 0
      ? payload.text
      : '(empty note)';
    const preview = text.length > 80 ? `${text.slice(0, 80)}…` : text;

    const li = list.createEl('li', { cls: 'ros-note-entry' });
    li.style.cursor = 'pointer';
    if (entry.conflicted) li.createSpan({ text: '⚠ ', cls: 'ros-conflict-marker' });
    li.createSpan({ text: preview });
    li.addEventListener('click', () => new NoteDetailModal(this.app, this.store, entry.element).open());
  }
}

const DETAIL_DIMENSIONS = ['thread', 'stage', 'confidence', 'positivity'] as const;

/** Read-only: full Note Block text plus every Contextual Property's current
 *  value(s). Editing/superseding is future work — v0 needs the researcher to
 *  be able to see an object's full semantic position, not yet to change it
 *  from here. */
class NoteDetailModal extends Modal {
  constructor(app: App, private readonly store: Store, private readonly elementId: string) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    const el = getElement(this.store, this.elementId);
    const payload = el && el.role === 'content' ? (el.payload as { text?: string } | null) : null;

    contentEl.createEl('h3', { text: 'Note' });
    contentEl.createEl('p', { text: payload?.text?.length ? payload.text : '(empty note)' });

    contentEl.createEl('h4', { text: 'Contextual properties' });
    const list = contentEl.createEl('ul');
    for (const dim of DETAIL_DIMENSIONS) {
      const coord = getCoordinate(this.store, this.elementId, dim);
      const display = coord && coord.values.length > 0
        ? coord.values.map((v) => String(v.value)).join(' / ')
        : '(unset)';
      const conflictNote = coord && coord.values.length > 1 ? '  ⚠ conflicting values' : '';
      list.createEl('li', { text: `${dim}: ${display}${conflictNote}` });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

class CaptureModal extends Modal {
  private text = '';
  private properties: CapturedProperties = { thread: '', stage: '', confidence: '', positivity: '' };

  constructor(app: App, private readonly onSubmit: (text: string, properties: CapturedProperties) => void) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Capture' });

    new Setting(contentEl)
      .setName('Note Block')
      .setDesc('Free-form research content. Preserved as written, never interpreted or classified.')
      .addTextArea((t) => t.onChange((v) => { this.text = v; }));

    contentEl.createEl('h4', { text: 'Contextual properties' });
    contentEl.createEl('p', {
      text: 'All optional. You decide these — the system does not infer them.',
      cls: 'setting-item-description',
    });

    new Setting(contentEl)
      .setName('Thread')
      .setDesc('Which line of research this note belongs to.')
      .addText((t) => t.onChange((v) => { this.properties.thread = v; }));

    new Setting(contentEl)
      .setName('Stage')
      .setDesc('Where this sits in the research process.')
      .addDropdown((d) => d
        .addOptions({ '': '(unset)', planning: 'Planning', in_progress: 'In progress', analysis: 'Analysis', complete: 'Complete' })
        .onChange((v) => { this.properties.stage = v; }));

    new Setting(contentEl)
      .setName('Confidence')
      .setDesc('How confident you are in this, 0–1.')
      .addText((t) => t.setPlaceholder('e.g. 0.7').onChange((v) => { this.properties.confidence = v; }));

    new Setting(contentEl)
      .setName('Positivity')
      .setDesc('The valence of the result, if this note reports one.')
      .addDropdown((d) => d
        .addOptions({ '': '(unset)', positive: 'Positive', negative: 'Negative', mixed: 'Mixed', inconclusive: 'Inconclusive' })
        .onChange((v) => { this.properties.positivity = v; }));

    new Setting(contentEl).addButton((b) =>
      b.setButtonText('Capture').setCta().onClick(() => {
        this.close();
        this.onSubmit(this.text, this.properties);
      }));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
