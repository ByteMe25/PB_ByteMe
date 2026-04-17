/* Inizializza EasyMDE, gestisce auto-save del testo (debounce + flush su unmount), 
 * espone getSelection(), insertText(), clearEditor(), e coordina il trigger addEntry per lo storico
*/

// src/features/editor/hooks/useEditor.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import EasyMDE from 'easymde';
import { useEditorMetaStore } from '../store/useEditorMetaStore';

const CONTENT_KEY = 'secondbrain-editor-content';
const DEBOUNCE_MS = 500;

export interface UseEditorProps {
  onEntryAdded?: (entry: unknown) => void;
}


export const useEditor = ({ onEntryAdded }: UseEditorProps = {}) => {
  //useRef per mantenere istanza EasyMDE e timer debounce senza causare re-render (useState causerebbe re-render)
  const easyMdeRef = useRef<EasyMDE | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { markDirty, markSaved } = useEditorMetaStore();
  const [isReady, setIsReady] = useState(false);

  const initialContent = typeof window !== 'undefined'
    ? (localStorage.getItem(CONTENT_KEY) || '')
    : '';

//appena la pagina viene caricata, React esegue questo blocco:
  useEffect(() => {
    if (!textareaRef.current || easyMdeRef.current) return; //protezione contro doppia inizializzazione (non crea 2 editor)

    //legge dal localStorage per ripristinare il testo di "ieri" e monta EasyMDE sopra la textarea
    easyMdeRef.current = new EasyMDE({
      element: textareaRef.current,
      initialValue: initialContent,
      spellChecker: false,
      status: ['autosave', 'lines', 'words', 'cursor'],
    });

/* CodeMirror non ha un evento "change" nativo, quindi usiamo on('change') di EasyMDE: intercetta modifiche e implementa debounce + auto-save
 * l'hook distrugge il timer precedente (clearTimeout) e ne crea uno nuovo di 500 millisecondi:
 * solo quando l'utente si ferma per mezzo secondo, il testo viene salvato su localStorage e markSaved() viene chiamato
*/
    const cm = easyMdeRef.current.codemirror;
    const handleChange = () => {
      const text = easyMdeRef.current?.value() || '';
      markDirty(); //ci sono modifiche non salvate

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(CONTENT_KEY, text);
          markSaved(); //modifiche salvate
        } catch (e) { console.error('❌ Auto-save fallito:', e); }
      }, DEBOUNCE_MS);
    };

    cm.on('change', handleChange);
    setIsReady(true);

    /* quando si cambia pagina React distrugge la pagina dell'editor ma questo blocco fa Flush Save:
    * salva immediatamente l'ultimo millisecondo di testo scritto (senza aspettare il debounce) e pulisce l'istanza di EasyMDE
    */
    return () => {
      cm.off('change', handleChange);
      try {
        const finalText = easyMdeRef.current?.value() || '';
        localStorage.setItem(CONTENT_KEY, finalText);
        markSaved();
      } catch (e) { console.error('❌ Flush save fallito:', e); }

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      easyMdeRef.current?.toTextArea();
      easyMdeRef.current = null;
    };
  }, []);


//API esposte: usano useCallback per essere memorizzate e non venire ricreate inutilmente a ogni render
  const getEditorText = useCallback(() => easyMdeRef.current?.value() || '', []);
  const getSelection = useCallback(() => easyMdeRef.current?.codemirror.getSelection() || '', []);

  const insertTextAtCursor = useCallback((text: string) => {
    const cm = easyMdeRef.current?.codemirror;
    if (!cm) return;

    const currentSelection = cm.getSelection();

    if (currentSelection) {
      //c'è una selezione: mantiene il testo originale e aggiunge l'AI sotto
      cm.replaceSelection(currentSelection + '\n\n' + text);
    } else {
      //nessuna selezione: va alla fine del documento
      const lastLine = cm.lastLine();
      const lastChar = cm.getLine(lastLine).length;
      
      //sposta il cursore alla fine fisica del file
      cm.setCursor({ line: lastLine, ch: lastChar });
      
      //se il documento non è vuoto, aggiunge due ritorni a capo per staccare il testo
      const prefix = cm.getValue().trim() === '' ? '' : '\n\n';
      cm.replaceSelection(prefix + text);
    }
    
    markDirty();
  }, [markDirty]);


  const clearEditor = useCallback(() => {
    if (easyMdeRef.current) {
      easyMdeRef.current.value('');
      localStorage.removeItem(CONTENT_KEY);
      markSaved();
    }
  }, [markSaved]);

  return {
    textareaRef,
    isReady,
    getEditorText,
    getSelection,
    insertTextAtCursor,
    clearEditor,
    onEntryAdded, //fondamentale per Dependency Injection con History *
  };
};

/*
 *Restituendo la prop onEntryAdded alla fine, permetti all'hook di fare da tramite tra AI Panel e lo Storico, per aggiornarlo.
 * Editor e Storico sono disaccoppiati, ma grazie a onEntryAdded l'Editor può notificare lo Storico quando viene 
 * aggiunta una nuova voce (entry) senza conoscere i dettagli dello Storico,
*/