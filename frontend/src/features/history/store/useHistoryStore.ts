import type { HistoryEntry } from '../types/HistoryEntry';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  deleteEntry: (id: string) => void;
}


export const useHistoryStore = create<HistoryStore>()(
  persist(
    //primo parametro di persist: funzione che crea lo stato
    (set) => ({
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
    }), 
    
    // secondo parametro di persist: opzioni di configurazione
    { 
      name: 'secondbrain-history', //chiave per LocalStorage del browser
      version: 0,
    }
  )
);