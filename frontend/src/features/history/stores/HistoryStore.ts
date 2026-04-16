import { create } from 'zustand';
import type { HistoryItem } from '../types/HistoryItem';

interface HistoryStore {
  entries: HistoryItem[];
  addEntry: (entry: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  deleteEntry: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  entries: [],

  addEntry: (entry) => set((state) => ({
    entries: [
      {
        ...entry,
        id: crypto.randomUUID(), //id lato frontend
        timestamp: new Date().toISOString(),
      },
      ...state.entries, //nuova generazione in cima
    ],
  })),

  deleteEntry: (id) => set((state) => ({
    entries: state.entries.filter(e => e.id !== id),
  })),
}));