import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadExcludedPrefixes, saveExcludedPrefixes } from './preferences.js';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('preferences — excluded group prefixes', () => {
  it('returns an empty list when nothing has been saved', () => {
    expect(loadExcludedPrefixes('St Ives')).toEqual([]);
    expect(loadExcludedPrefixes(null)).toEqual([]);
  });

  it('round-trips a saved list for a u3a', () => {
    saveExcludedPrefixes('St Ives', ['Outing', 'Theatres']);
    expect(loadExcludedPrefixes('St Ives')).toEqual(['Outing', 'Theatres']);
  });

  it('keys are case-insensitive and trimmed', () => {
    saveExcludedPrefixes('  St Ives  ', ['Outing']);
    expect(loadExcludedPrefixes('st ives')).toEqual(['Outing']);
    expect(loadExcludedPrefixes('ST IVES')).toEqual(['Outing']);
  });

  it('keeps prefs for different u3as separate', () => {
    saveExcludedPrefixes('St Ives', ['Outing']);
    saveExcludedPrefixes('Other u3a', ['POSS']);
    expect(loadExcludedPrefixes('St Ives')).toEqual(['Outing']);
    expect(loadExcludedPrefixes('Other u3a')).toEqual(['POSS']);
  });

  it('null u3a name uses the unknown bucket', () => {
    saveExcludedPrefixes(null, ['Events']);
    expect(loadExcludedPrefixes(null)).toEqual(['Events']);
  });

  it('drops empty / whitespace-only prefixes on save', () => {
    saveExcludedPrefixes('St Ives', ['Outing', '', '  ', 'Theatres']);
    expect(loadExcludedPrefixes('St Ives')).toEqual(['Outing', 'Theatres']);
  });

  it('recovers to empty list when stored JSON is malformed', () => {
    localStorage.setItem('analyse-u3a:prefs:v1', '{not-json');
    expect(loadExcludedPrefixes('St Ives')).toEqual([]);
  });

  it('recovers to empty list when stored JSON is the wrong shape', () => {
    localStorage.setItem('analyse-u3a:prefs:v1', '[]');
    expect(loadExcludedPrefixes('St Ives')).toEqual([]);
  });
});
