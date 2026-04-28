/* Store per i metadati dell'editor - Zustand - MODEL
 * Gestisce fileName, isDirty, lastSaved. Persiste in localStorage tramite middleware persist.
 * Espone azioni setFileName(), markDirty(), markSaved().
*/

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Modello leggero per i metadati dell'editor:
 * NON contiene il testo del documento (gestito manualmente in useEditor.ts per performance)
 * Gestisce solo stato UI e configurazione sessione
 */
export interface EditorMetaState {
  // stati 
  fileName: string;
  isDirty: boolean;
  lastSaved: number | null;
  
  // azioni
  setFileName: (name: string) => void;
  markSaved: () => void;
  markDirty: () => void;
}

/* persist permette allo store di salvare automaticamente i metadati nel localStorage del browser a ogni modifica,
 * garantendo che se l'utente chiude la tab per sbaglio, al rientro troverà il nome del file intatto 
 * e saprà se aveva delle modifiche non salvate (grazie a isDirty)
*/
export const useEditorMetaStore = create<EditorMetaState>()(
  persist(
    (set) => ({
      //valori di default iniziali
      fileName: 'Documento senza titolo',
      isDirty: false,
      lastSaved: null,

      //azioni
      setFileName: (name: string) => 
        set({ 
          fileName: name, 
          //rinomimare il file rende lo stato "sporco" perché il nome corrente non è più allineato con l'ultimo file scaricato
          isDirty: true
        }),

      markSaved: () => 
        set({ 
          isDirty: false, 
          lastSaved: Date.now() 
        }),

      markDirty: () => 
        set({ 
          isDirty: true 
        }),
    }),
    {
      //nome della chiave dedicata nel localStorage del browser
      name: 'secondbrain-editor-meta',
      version: 0, //versione dello schema per supportare eventuali migrazioni future
      //salva solo i dati puri, prevenendo comportamenti imprevisti.
      partialize: (state) => ({
        fileName: state.fileName,
        isDirty: state.isDirty,
        lastSaved: state.lastSaved,
      }),
    }
  )
);