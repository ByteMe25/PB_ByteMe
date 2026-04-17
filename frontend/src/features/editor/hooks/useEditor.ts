/* ViewModel principale dell'editor
 *  - Crea e distrugge l'istanza EasyMDE (unica nel sistema — MarkdownEditor è View pura)
 *  - Configura toolbar e comportamenti EasyMDE
 *  - Implementa auto-save con debounce su localStorage
 *  - Espone API pulite: getEditorText, getSelection, insertTextAtCursor, clearEditor
 *  - Gestisce la vista side-by-side di default
 *  - Riceve onEntryAdded tramite Dependency Injection per disaccoppiamento con History
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import EasyMDE from 'easymde';
import toast from 'react-hot-toast';
import { useEditorMetaStore } from '../store/useEditorMetaStore';

const CONTENT_KEY = 'secondbrain-editor-content';
const DEBOUNCE_MS = 500;

export interface UseEditorProps {
  //callback iniettata da EditorPage per aggiungere voci allo Storico (Dependency Injection)
  onEntryAdded?: (entry: unknown) => void;
}

export interface UseEditorReturn {
  //Ref da passare alla textarea in MarkdownEditor
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  //True quando EasyMDE è montato e pronto
  isReady: boolean;
  //Restituisce tutto il testo dell'editor
  getEditorText: () => string;
  //Restituisce il testo attualmente selezionato ('' se nulla)
  getSelection: () => string;

  /** Inserisce testo generato dall'AI:
   * - Se c'è selezione attiva: inserisce dopo la selezione
   * - Se non c'è selezione: inserisce in fondo al documento
   */
  insertTextAtCursor: (text: string) => void;

  //Svuota l'editor e rimuove il contenuto dal localStorage
  clearEditor: () => void;
  //Ripristina l'istanza al contenuto del localStorage (utile dopo cambio file)
  reloadFromStorage: () => void;
  //Callback per lo storico (passata via DI da EditorPage)
  onEntryAdded?: (entry: unknown) => void;
}

export const useEditor = ({ onEntryAdded }: UseEditorProps = {}): UseEditorReturn => {
  const easyMdeRef = useRef<EasyMDE | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { markDirty, markSaved } = useEditorMetaStore();
  const [isReady, setIsReady] = useState(false);

  //legge dal localStorage solo al primo mount, non durante i re-render
  const initialContent =
    typeof window !== 'undefined' ? localStorage.getItem(CONTENT_KEY) ?? '' : '';


  //montaggio EasyMDE
  useEffect(() => {
    //non crea due istanze se il componente si monta due volte (StrictMode)
    if (!textareaRef.current || easyMdeRef.current) return;

    easyMdeRef.current = new EasyMDE({
      element: textareaRef.current,
      initialValue: initialContent,
      spellChecker: false,
      sideBySideFullscreen: false,
      autofocus: true,
      inputStyle: 'contenteditable',
      status: ['autosave', 'lines', 'words', 'cursor'],
      syncSideBySidePreviewScroll: false,

      // CONFIGURAZIONE TOOLBAR
      toolbar: [
        'undo', 'redo', '|',
        'bold', 'italic',
        {
          name: 'underline',
          action: (editor) => {
            const cm = editor.codemirror;
            const selected = cm.getSelection();
            cm.replaceSelection(`<u>${selected || 'testo'}</u>`);
          },
          className: 'fa fa-underline',
          title: 'Sottolineato',
        },
        '|',
        'heading-smaller', 'heading-bigger', '|',
        'table',
        {
          name: 'horizontal-rule',
          action: (editor) => {
            const cm = editor.codemirror;
            cm.replaceRange('\n\n---\n\n', cm.getCursor());
            cm.focus();
          },
          className: 'fa fa-minus',
          title: 'Linea orizzontale',
        },
        'link',
        '|',
        'unordered-list',
        'ordered-list',
        '|',

        //copia, incolla, taglia
        
        {
          name: 'copy',
          action: (editor) => {
            const txt = editor.codemirror.getSelection();
            if (!txt) {
              toast.error('Seleziona del testo prima di copiare.');
              return;
            }
            navigator.clipboard
              .writeText(txt)
              .then(() => toast.success('Copiato negli appunti!'));
          },
          className: 'fa fa-copy',
          title: 'Copia (Ctrl+C)',
        },
        {
          name: 'paste',
          action: (editor) => {
            navigator.clipboard
              .readText()
              .then((t) => {
                editor.codemirror.replaceSelection(t);
                toast.success('Testo incollato!');
              })
              .catch(() => toast.error('Usa Ctrl+V per incollare.'));
          },
          className: 'fa fa-paste',
          title: 'Incolla (Ctrl+V)',
        },
        {
          name: 'cut',
          action: (editor) => {
            const cm = editor.codemirror;
            const txt = cm.getSelection();
            if (!txt) {
              toast.error('Seleziona del testo prima di tagliare.');
              return;
            }
            navigator.clipboard.writeText(txt).then(() => {
              cm.replaceSelection('');
              toast.success('Testo tagliato!');
            });
          },
          className: 'fa fa-scissors',
          title: 'Taglia (Ctrl+X)',
        },
        '|',

        //modalità di visualizzazione
        {
          name: 'editor-only',
          action: (editor) => {
            if (editor.isPreviewActive()) EasyMDE.togglePreview(editor);
            if (editor.isSideBySideActive()) EasyMDE.toggleSideBySide(editor);
          },
          className: 'fa fa-pen',
          title: 'Solo Editor',
        },
        {
          name: 'preview-only',
          action: (editor) => {
            if (editor.isSideBySideActive()) EasyMDE.toggleSideBySide(editor);
            if (!editor.isPreviewActive()) EasyMDE.togglePreview(editor);
          },
          className: 'fa fa-eye',
          title: 'Solo Anteprima',
        },
        {
          name: 'side-by-side',
          action: (editor) => {
            if (editor.isPreviewActive()) EasyMDE.togglePreview(editor);
            if (!editor.isSideBySideActive()) EasyMDE.toggleSideBySide(editor);
          },
          className: 'fa fa-columns',
          title: 'Modalità Affiancata',
        },
      ],
    });

    //vista di default: side-by-side
    //setTimeout necessario perché EasyMDE ha bisogno di un tick per inizializzarsi
    const sideBySideTimer = setTimeout(() => {
      if (easyMdeRef.current && !easyMdeRef.current.isSideBySideActive()) {
        EasyMDE.toggleSideBySide(easyMdeRef.current);
      }
    }, 100);


    //AUTO SAVE CON DEBOUNCE
    const cm = easyMdeRef.current.codemirror;

    const handleChange = () => {
      const text = easyMdeRef.current?.value() ?? '';
      markDirty(); //segnala modifiche non salvate al Model

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(CONTENT_KEY, text);
          markSaved();
        } catch (e) {
          console.error('❌ Auto-save fallito:', e);
        }
      }, DEBOUNCE_MS);
    };

    cm.on('change', handleChange);
    setIsReady(true);


    //cleanup: flush immediato + distruzione istanza
    return () => {
      clearTimeout(sideBySideTimer);
      cm.off('change', handleChange);

      //salva l'ultimo testo senza aspettare il debounce
      try {
        const finalText = easyMdeRef.current?.value() ?? '';
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        localStorage.setItem(CONTENT_KEY, finalText);
        markSaved();
      } catch (e) {
        console.error('❌ Flush save fallito:', e);
      }

      easyMdeRef.current?.toTextArea();
      easyMdeRef.current = null;
      setIsReady(false);
    };
  }, []);


  // API pubbliche - useCallback per stabilità referenziale (evita re-render)
  const getEditorText = useCallback((): string => {
    return easyMdeRef.current?.value() ?? '';
  }, []);

  const getSelection = useCallback((): string => {
    return easyMdeRef.current?.codemirror.getSelection() ?? '';
  }, []);


  //inserisce testo generato dall'AI dopo la selezione, o in fondo se non c'è selezione
  const insertTextAtCursor = useCallback(
    (text: string): void => {
      const cm = easyMdeRef.current?.codemirror;
      if (!cm) return;

      const currentSelection = cm.getSelection();

      if (currentSelection) {
        //mantiene la selezione originale + inserisce la generazione AI dopo
        cm.replaceSelection(currentSelection + '\n\n' + text);
      } else {
        // Vai alla fine del documento
        const lastLine = cm.lastLine();
        const lastChar = cm.getLine(lastLine).length;
        cm.setCursor({ line: lastLine, ch: lastChar });

        //se il documento non è vuoto, aggiunge spaziatura
        const prefix = cm.getValue().trim() === '' ? '' : '\n\n';
        cm.replaceSelection(prefix + text);
      }

      markDirty();
    },
    [markDirty]
  );


  //svuota editor e localStorage (X della Topbar)
  const clearEditor = useCallback((): void => {
    if (!easyMdeRef.current) return;
    easyMdeRef.current.value('');
    localStorage.removeItem(CONTENT_KEY);
    markSaved();
  }, [markSaved]);

  
  //ricarica il contenuto dal localStorage nell'editor
  const reloadFromStorage = useCallback((): void => {
    if (!easyMdeRef.current) return;
    const saved = localStorage.getItem(CONTENT_KEY) ?? '';
    easyMdeRef.current.value(saved);
    markSaved();
  }, [markSaved]);

  return {
    textareaRef,
    isReady,
    getEditorText,
    getSelection,
    insertTextAtCursor,
    clearEditor,
    reloadFromStorage,
    onEntryAdded,
  };
};