import { Injectable } from '@angular/core';

/**
 * Thin, typed wrapper around `localStorage` with safe JSON handling
 * and an in-memory fallback for SSR / privacy-mode contexts.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly memory = new Map<string, string>();
  private readonly available = this.checkAvailable();

  get<T>(key: string): T | null {
    const raw = this.available ? localStorage.getItem(key) : this.memory.get(key) ?? null;
    if (raw == null) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  }

  set<T>(key: string, value: T): void {
    const raw = JSON.stringify(value);
    if (this.available) localStorage.setItem(key, raw);
    else this.memory.set(key, raw);
  }

  remove(key: string): void {
    if (this.available) localStorage.removeItem(key);
    else this.memory.delete(key);
  }

  clear(): void {
    if (this.available) localStorage.clear();
    else this.memory.clear();
  }

  private checkAvailable(): boolean {
    try {
      const k = '__ll_probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  }
}
