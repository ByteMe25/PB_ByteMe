import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEditor } from './useEditor';
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import EasyMDE from 'easymde';


//mock EasyMDE: simula codemirror.on('change') per testare il debounce
// sostituisce l'intera libreria con un oggetto finto + helper _triggerChange()
vi.mock('easymde', () => {
  let changeHandler: (() => void) | null = null;
  
  // Usiamo una funzione classica invece di una arrow function
  const MockEasyMDE = vi.fn(function() {
    return {
      codemirror: {
        on: vi.fn((event: string, cb: () => void) => { if (event === 'change') changeHandler = cb; }),
        off: vi.fn(),
        getSelection: vi.fn().mockReturnValue(''),
        replaceSelection: vi.fn(),
        //per gestire inserimento generazioni AI
        lastLine: vi.fn().mockReturnValue(0),
        getLine: vi.fn().mockReturnValue(''),
        setCursor: vi.fn(),
        getValue: vi.fn().mockReturnValue(''),
      },
      value: vi.fn().mockReturnValue(''),
      getSelection: vi.fn().mockReturnValue(''),
      toTextArea: vi.fn(),
      //helper esposto solo ai test per simulare la digitazione
      _triggerChange: () => changeHandler?.(),
    };
  });

  return { default: MockEasyMDE };
});

//mock Store (Zustand): intercetta markDirty e markSaved per verificare chiamate
const mockMarkDirty = vi.fn();
const mockMarkSaved = vi.fn();

vi.mock('../store/useEditorMetaStore', () => ({
  useEditorMetaStore: vi.fn(),
}));


describe('useEditor (ViewModel)', () => {
  beforeEach(() => {
    //ordine corretto dei timer
    vi.useFakeTimers(); //per testare il debounce
    vi.clearAllMocks();
    localStorage.clear();

    //setup del mock store per ogni test per evitare stale closures sull'unmount
    vi.mocked(useEditorMetaStore).mockReturnValue({
      markDirty: mockMarkDirty,
      markSaved: mockMarkSaved,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  //funzione helper per iniettare la text area (senza questa l'hook fa return anticipato)
  const renderEditorHook = (props = {}) => {
    return renderHook(() => {
      const hook = useEditor(props);
      if (!hook.textareaRef.current) {
        // @ts-ignore - forziamo l'assegnazione per il test
        hook.textareaRef.current = document.createElement('textarea');
      }
      return hook;
    });
  };


  it('inizializza EasyMDE e carica contenuto da localStorage', () => {
    localStorage.setItem('secondbrain-editor-content', '# Testo salvato');
    const { result } = renderEditorHook();

    expect(EasyMDE).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: '# Testo salvato' })
    );
    expect(result.current.isReady).toBe(true);
  });


  //getEditorText() e getSelection() restituiscono ciò che l'istanza EasyMDE/CodeMirror contiene
  it('espone API per lettura testo e selezione', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value;

    mockInstance.value.mockReturnValue('Testo attuale');
    expect(result.current.getEditorText()).toBe('Testo attuale');

    mockInstance.codemirror.getSelection.mockReturnValue('selezionato');
    expect(result.current.getSelection()).toBe('selezionato');
  });


  it('inserisce il testo AI alla fine del documento se non c\'è selezione', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value;
    
    mockInstance.codemirror.getSelection.mockReturnValue('');
    mockInstance.codemirror.getValue.mockReturnValue('');

    result.current.insertTextAtCursor('Testo AI');

    expect(mockInstance.codemirror.setCursor).toHaveBeenCalled();
    expect(mockInstance.codemirror.replaceSelection).toHaveBeenCalledWith('Testo AI');
  });


  it('esegue il debounce del salvataggio su modifica testo', () => {
    renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value;
    
    mockInstance.value.mockReturnValue('Testo modificato');
    act(() => { mockInstance._triggerChange(); });

    expect(mockMarkDirty).toHaveBeenCalled();
    
    act(() => { vi.advanceTimersByTime(500); });
    expect(localStorage.getItem('secondbrain-editor-content')).toBe('Testo modificato');
    expect(mockMarkSaved).toHaveBeenCalled();
  });


  it('esegue flush immediato allo smontaggio', () => {
    const { unmount } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value;
    mockInstance.value.mockReturnValue('Testo finale');

    act(() => { unmount(); });

    expect(localStorage.getItem('secondbrain-editor-content')).toBe('Testo finale');
    expect(mockMarkSaved).toHaveBeenCalled();
  });


  //implementa Dependency Injection: l'hook non importa HistoryStore né useAiOperation
  //la prop onEntryAdded passata dall'esterno viene restituita identica dall'hook, pronta per essere inoltrata alla View
  it('espone la callback onEntryAdded per integrazione AI/History (DI)', () => {
    const mockCallback = vi.fn();
    const { result } = renderEditorHook({ onEntryAdded: mockCallback });
    expect(result.current.onEntryAdded).toBe(mockCallback);
  });
});