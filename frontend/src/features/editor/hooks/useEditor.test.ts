import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEditor } from './useEditor';
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import EasyMDE from 'easymde';

//mock EasyMDE: simula codemirror.on('change') per testare il debounce
vi.mock('easymde', () => {
  let changeHandler: (() => void) | null = null;

  const MockEasyMDE = vi.fn(function () {
    return {
      codemirror: {
        on: vi.fn((event: string, cb: () => void) => {
          if (event === 'change') changeHandler = cb;
        }),
        off: vi.fn(),
        getSelection: vi.fn().mockReturnValue(''),
        replaceSelection: vi.fn(),
        lastLine: vi.fn().mockReturnValue(0),
        getLine: vi.fn().mockReturnValue(''),
        setCursor: vi.fn(),
        getValue: vi.fn().mockReturnValue(''),
      },
      value: vi.fn().mockReturnValue(''),
      isSideBySideActive: vi.fn().mockReturnValue(false),
      isPreviewActive: vi.fn().mockReturnValue(false),
      toTextArea: vi.fn(),
      //helper per simulare la digitazione nei test
      _triggerChange: () => changeHandler?.(),
    };
  });

  //metodi statici usati per le viste
  (MockEasyMDE as any).toggleSideBySide = vi.fn();
  (MockEasyMDE as any).togglePreview = vi.fn();

  return { default: MockEasyMDE };
});

//mock dello Store Zustand
const mockMarkDirty = vi.fn();
const mockMarkSaved = vi.fn();

vi.mock('../store/useEditorMetaStore', () => ({
  useEditorMetaStore: vi.fn(),
}));

//helper: renderizza l'hook con una textarea iniettata
const renderEditorHook = (props = {}) => {
  return renderHook(() => {
    const hook = useEditor(props);
    if (!hook.textareaRef.current) {
      hook.textareaRef.current = document.createElement('textarea');
    }
    return hook;
  });
};

describe('useEditor (ViewModel)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();

    vi.mocked(useEditorMetaStore).mockReturnValue({
      markDirty: mockMarkDirty,
      markSaved: mockMarkSaved,
    } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  //inizializzazione
  it('inizializza EasyMDE e carica il contenuto da localStorage', () => {
    localStorage.setItem('secondbrain-editor-content', '# Testo salvato');
    renderEditorHook();

    expect(EasyMDE).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: '# Testo salvato' })
    );
  });


  it('espone isReady = true dopo il mount', () => {
    const { result } = renderEditorHook();
    expect(result.current.isReady).toBe(true);
  });


  it('attiva side-by-side dopo il setTimeout iniziale', () => {
    renderEditorHook();
    act(() => vi.advanceTimersByTime(100));
    expect((EasyMDE as any).toggleSideBySide).toHaveBeenCalledTimes(1);
  });


  it('non ri-attiva side-by-side se è già attivo', () => {
    renderEditorHook();
    const mockInstance = vi.mocked(EasyMDE).mock.results[0].value as any;
    mockInstance.isSideBySideActive.mockReturnValue(true);

    act(() => vi.advanceTimersByTime(100));
    expect((EasyMDE as any).toggleSideBySide).not.toHaveBeenCalled();
  });


  //API di lettura
  it('getEditorText restituisce il testo corrente dell\'istanza EasyMDE', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value as any;

    mockInstance.value.mockReturnValue('Testo attuale');
    expect(result.current.getEditorText()).toBe('Testo attuale');
  });


  it('getSelection restituisce il testo selezionato da CodeMirror', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value as any;

    mockInstance.codemirror.getSelection.mockReturnValue('testo selezionato');
    expect(result.current.getSelection()).toBe('testo selezionato');
  });


  it('inserisce il testo in fondo se non c\'è selezione', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value as any;

    mockInstance.codemirror.getSelection.mockReturnValue('');
    mockInstance.codemirror.getValue.mockReturnValue('');

    result.current.insertTextAtCursor('Testo AI');

    expect(mockInstance.codemirror.setCursor).toHaveBeenCalled();
    expect(mockInstance.codemirror.replaceSelection).toHaveBeenCalledWith('Testo AI');
  });


  it('inserisce il testo dopo la selezione se c\'è testo selezionato', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value as any;

    mockInstance.codemirror.getSelection.mockReturnValue('testo originale');

    result.current.insertTextAtCursor('Testo AI');

    expect(mockInstance.codemirror.replaceSelection).toHaveBeenCalledWith(
      'testo originale\n\nTesto AI'
    );
  });


  //Auto-save con debounce
  it('chiama markDirty immediatamente alla modifica e salva dopo il debounce', () => {
    renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value as any;
    mockInstance.value.mockReturnValue('Testo modificato');

    act(() => { mockInstance._triggerChange(); });
    expect(mockMarkDirty).toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(500); });
    expect(localStorage.getItem('secondbrain-editor-content')).toBe('Testo modificato');
    expect(mockMarkSaved).toHaveBeenCalled();
  });


  it('esegue flush immediato e chiama toTextArea allo smontaggio', () => {
    const { unmount } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value as any;
    mockInstance.value.mockReturnValue('Testo finale');

    act(() => { unmount(); });

    expect(localStorage.getItem('secondbrain-editor-content')).toBe('Testo finale');
    expect(mockMarkSaved).toHaveBeenCalled();
    expect(mockInstance.toTextArea).toHaveBeenCalledTimes(1);
  });


  it('clearEditor svuota l\'editor e rimuove il localStorage', () => {
    localStorage.setItem('secondbrain-editor-content', 'da cancellare');
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value;

    result.current.clearEditor();

    expect(mockInstance.value).toHaveBeenCalledWith('');
    expect(localStorage.getItem('secondbrain-editor-content')).toBeNull();
    expect(mockMarkSaved).toHaveBeenCalled();
  });


  it('reloadFromStorage aggiorna EasyMDE con il contenuto del localStorage', () => {
    const { result } = renderEditorHook();
    const results = vi.mocked(EasyMDE).mock.results;
    const mockInstance = results[results.length - 1].value;

    localStorage.setItem('secondbrain-editor-content', '# Nuovo contenuto');
    result.current.reloadFromStorage();

    expect(mockInstance.value).toHaveBeenCalledWith('# Nuovo contenuto');
    expect(mockMarkSaved).toHaveBeenCalled();
  });


  //dependency injection: onEntryAdded
  it('espone onEntryAdded identica a quella ricevuta tramite DI', () => {
    const mockCallback = vi.fn();
    const { result } = renderEditorHook({ onEntryAdded: mockCallback });
    expect(result.current.onEntryAdded).toBe(mockCallback);
  });
});