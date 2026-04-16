// src/features/editor/hooks/useFileUpload.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from './useFileUpload';
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import toast from 'react-hot-toast';

//mock del Toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

//mock dello Store Zustand (Zustand esporta getState() che possiamo mockare)
vi.mock('../store/useEditorMetaStore', () => ({
  useEditorMetaStore: {
    getState: vi.fn(),
  },
}));

//mock del FileReader (API nativa del browser)
class MockFileReader {
  onload: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;

  readAsText(file: File) {
    setTimeout(() => {
      if (file.name === 'corrotto.md') {
        this.onerror && this.onerror(new ProgressEvent('error'));
      } else {
        this.onload && this.onload({ target: { result: '# Contenuto del file caricato' } });
      }
    }, 10);
  }
}


describe('useFileUpload (ViewModel)', () => {
  const mockOnFileLoaded = vi.fn();
  const mockSetFileName = vi.fn();
  const mockMarkSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    //setup di base del window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    //modo corretto e type-safe per mockare in Vitest
    vi.stubGlobal('FileReader', MockFileReader);

    //setup di default dello store
    vi.mocked(useEditorMetaStore.getState).mockReturnValue({
      isDirty: false,
      setFileName: mockSetFileName,
      markSaved: mockMarkSaved,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    //rimuove il mock del FileReader alla fine del test
    vi.unstubAllGlobals();
  });


  //requisito obbligatorio
  it('rifiuta file con estensione non valida', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const invalidFile = new File(['test'], 'immagine.png', { type: 'image/png' });

    await act(async () => {
      await result.current.processFile(invalidFile);
    });

    expect(toast.error).toHaveBeenCalledWith('Formato non supportato. Carica solo file .md o .txt');
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });


  // requisito obbligatorio
  it('rifiuta file che superano la dimensione massima (5MB)', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const largeFile = new File([''], 'grande.md', { type: 'text/markdown' });
    
    Object.defineProperty(largeFile, 'size', { 
      value: 6 * 1024 * 1024, 
      configurable: true, 
      writable: false 
    }); 

    await act(async () => {
      await result.current.processFile(largeFile);
    });

    expect(toast.error).toHaveBeenCalledWith('Il file supera la dimensione massima di 5MB.');
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });


  //requisito obbligatorio
  it('se isDirty è true, chiede conferma. Se l\'utente annulla, non carica nulla', async () => {
    //simula che ci siano modifiche non salvate
    vi.mocked(useEditorMetaStore.getState).mockReturnValue({ isDirty: true } as any);
    //l'utente clicca "Annulla" sul prompt
    vi.mocked(window.confirm).mockImplementationOnce(() => false);

    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const validFile = new File(['test'], 'documento.md', { type: 'text/markdown' });

    await act(async () => {
      await result.current.processFile(validFile);
    });

    expect(window.confirm).toHaveBeenCalledWith('Hai delle modifiche non salvate. Sei sicuro di voler caricare un nuovo file e sovrascrivere quello attuale?');
    expect(mockOnFileLoaded).not.toHaveBeenCalled(); //l'upload si deve fermare
  });


  it('carica correttamente un file valido e aggiorna lo store', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const validFile = new File(['test'], 'appunti.md', { type: 'text/markdown' });

    await act(async () => {
      await result.current.processFile(validFile);
      //aspetta che la Promise del finto FileReader si risolva
      await new Promise((r) => setTimeout(r, 20)); 
    });

    //deve aver passato il testo all'editor
    expect(mockOnFileLoaded).toHaveBeenCalledWith('# Contenuto del file caricato');
    
    //deve aver aggiornato lo store (Model)
    expect(mockSetFileName).toHaveBeenCalledWith('appunti.md');
    expect(mockMarkSaved).toHaveBeenCalled();
    
    //deve aver mostrato il successo
    expect(toast.success).toHaveBeenCalledWith('File "appunti.md" caricato con successo!');
  });


  it('gestisce gli errori di lettura del FileReader senza far crashare l\'app', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const corruptedFile = new File(['test'], 'corrotto.md', { type: 'text/markdown' });

    await act(async () => {
      await result.current.processFile(corruptedFile);
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(toast.error).toHaveBeenCalledWith('Impossibile leggere il file.');
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });


  //test sullo spinner
  it('gestisce correttamente lo stato isUploading', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const validFile = new File(['test'], 'appunti.md', { type: 'text/markdown' });
    
    expect(result.current.isUploading).toBe(false); //inizialmente è false

    let processPromise: Promise<void>;
    
    act(() => {
      processPromise = result.current.processFile(validFile);
    });
    
    expect(result.current.isUploading).toBe(true); //durante l'esecuzione è true

    await act(async () => {
      await processPromise;
      await new Promise((r) => setTimeout(r, 20)); //aspetta il FileReader finto
    });

    expect(result.current.isUploading).toBe(false); //alla fine torna false
  });
});