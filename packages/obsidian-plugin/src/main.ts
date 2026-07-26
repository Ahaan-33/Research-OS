// Realizes Subsystem 8 (Visualization Layer) and the UI-facing half of
// Subsystem 10 (Event Processing), per Reference Implementation Strategy §7.
// Per ADR-0002/§2: ResearchState lives in this plugin's own SQLite file
// inside its data directory — NEVER as vault-visible .md files. The vault's
// markdown is Projection output only (rendered on demand), never live state.
import { App, Modal, Notice, Plugin, Setting } from 'obsidian';
import * as path from 'node:path';
import {
  openStore, closeStore, TransformationEngine, DependencyTracker,
  registerDimension, renderProjection, attribute, joint,
  type Store,
} from '@ros/core';

export default class ResearchOperatingSystemPlugin extends Plugin {
  private store!: Store;
  private engine!: TransformationEngine;

  async onload(): Promise<void> {
    const dbPath = path.join(
      (this.app.vault.adapter as unknown as { basePath: string }).basePath ?? '.',
      this.manifest.dir ?? '.obsidian/plugins/ros',
      'state.sqlite',
    );
    this.store = openStore(dbPath);
    this.engine = new TransformationEngine(this.store, new DependencyTracker());

    // Bootstrap the one dimension the v0 shell exercises (Thread View needs it).
    registerDimension(this.store, {
      dimension: 'thread',
      valueSpace: { kind: 'freeText' },
      registeredAt: Date.now(),
      registeredBy: joint([attribute('capture', 'plugin-init')]),
    });

    this.addCommand({
      id: 'ros-capture',
      name: 'ROS: Capture note',
      callback: () => new CaptureModal(this.app, (text) => this.handleCapture(text)).open(),
    });

    this.addCommand({
      id: 'ros-render-thread-view',
      name: 'ROS: Render Thread View',
      callback: () => this.renderView('thread_view'),
    });

    this.addCommand({
      id: 'ros-render-timeline',
      name: 'ROS: Render Timeline',
      callback: () => this.renderView('timeline'),
    });
  }

  onunload(): void {
    // Per [[13-Runtime-Architecture]] §11: no researcher-facing shutdown
    // procedure is required; every acknowledged write is already durable.
    // Closing the handle here is a resource-cleanliness courtesy, not a
    // correctness requirement.
    if (this.store) closeStore(this.store);
  }

  private handleCapture(text: string): void {
    const res = this.engine.capture({ text }, 'observation');
    if (res.ok) {
      new Notice('Captured.');
    } else {
      new Notice(`Capture rejected: ${res.error.code}`);
    }
  }

  private renderView(operator: 'thread_view' | 'timeline'): void {
    const view = renderProjection(this.store, { operator, parameters: {} });
    // v0: render as a plain Notice-backed summary. A dedicated ItemView with
    // real Markdown rendering is deferred — Doc17 §7 scopes v0 to proving
    // Capture/Interpret/render round-trip through a real Obsidian shell, not
    // to a polished view surface.
    const count = Array.isArray(view.content) ? view.content.length : 0;
    new Notice(`${operator}: ${count} element(s), conflictFaithful=${view.conflictFaithful}`);
  }
}

class CaptureModal extends Modal {
  private value = '';

  constructor(app: App, private readonly onSubmit: (text: string) => void) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h3', { text: 'Capture' });
    new Setting(contentEl).setName('Content').addText((t) =>
      t.onChange((v) => { this.value = v; }));
    new Setting(contentEl).addButton((b) =>
      b.setButtonText('Capture').setCta().onClick(() => {
        this.close();
        this.onSubmit(this.value);
      }));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
