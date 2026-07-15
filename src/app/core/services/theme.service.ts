import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '@env/environment';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Toggles the `.dark` class on <html> so both Material and Tailwind pick up the
 * dark palette. Persists the user's choice; falls back to system preference.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);
  private readonly doc     = inject(DOCUMENT);
  private readonly key     = environment.storageKeys.theme;

  private readonly _mode = signal<ThemeMode>(this.storage.get<ThemeMode>(this.key) ?? 'system');
  readonly mode = this._mode.asReadonly();
  readonly isDark = computed(() => this.resolve(this._mode()));

  constructor() {
    this.apply(this.isDark());
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this._mode() === 'system') this.apply(this.isDark());
      });
    }
  }

  set(mode: ThemeMode): void {
    this._mode.set(mode);
    this.storage.set(this.key, mode);
    this.apply(this.resolve(mode));
  }

  toggle(): void { this.set(this.isDark() ? 'light' : 'dark'); }

  private resolve(mode: ThemeMode): boolean {
    if (mode === 'dark')  return true;
    if (mode === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  private apply(dark: boolean): void {
    this.doc.documentElement.classList.toggle('dark', dark);
  }
}
