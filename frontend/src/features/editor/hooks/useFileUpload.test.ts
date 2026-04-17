// src/features/editor/hooks/useFileUpload.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from './useFileUpload';
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import toast from 'react-hot-toast';

//mock di react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

//mock per Zustand
vi.mock('../store/useEditorMetaStore', () => {
  const storeMock = vi.fn();
  //crea il mock direttamente qui dentro per evitare l'errore di hoisting di Vitest
  (storeMock as any).getState = vi.fn(); 
  return { useEditorMetaStore: storeMock };
});

describe('useFileUpload (ViewModel)', () => {
  const mockOnFileLoaded = vi.fn();
  const mockSetFileName = vi.fn();
  const mockMarkSaved = vi.fn();
  
  const originalConfirm = window.confirm;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    //simula che l'utente clicchi sempre "OK" sui popup di conferma
    window.confirm = vi.fn(() => true); 

    (useEditorMetaStore as any).getState.mockReturnValue({
      isDirty: false,
      setFileName: mockSetFileName,
      markSaved: mockMarkSaved,
    });
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });


  it('rifiuta i file con formato non supportato', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const invalidFile = new File([''], 'immagine.png', { type: 'image/png' });

    await act(async () => {
      await result.current.uploadFile(invalidFile);
    });

    expect(toast.error).toHaveBeenCalledWith('Formato non supportato. Carica solo file .md o .txt');
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });


  it('rifiuta i file troppo grandi', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'grande.md');

    await act(async () => {
      await result.current.uploadFile(largeFile);
    });

    expect(toast.error).toHaveBeenCalledWith('Il file supera la dimensione massima di 5MB.');
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });


  it('non carica il file se l\'utente annulla la conferma su documento sporco', async () => {
    //rende il documento "sporco"
    (useEditorMetaStore as any).getState.mockReturnValue({
      isDirty: true,
      setFileName: mockSetFileName,
      markSaved: mockMarkSaved,
    });
    //simula l'utente che clicca "Annulla"
    window.confirm = vi.fn(() => false); 

    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const validFile = new File(['testo'], 'appunti.md', { type: 'text/markdown' });

    await act(async () => {
      await result.current.uploadFile(validFile);
    });

    expect(window.confirm).toHaveBeenCalledWith('Hai modifiche non salvate. Sovrascrivere?');
    expect(mockOnFileLoaded).not.toHaveBeenCalled();
  });


  it('legge il file correttamente, salva in storage, aggiorna lo store e chiama l\'editor', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const validFile = new File(['# Ciao'], 'appunti_studio.md', { type: 'text/markdown' });

    await act(async () => {
      await result.current.uploadFile(validFile);
    });

    expect(localStorage.getItem('secondbrain-editor-content')).toBe('# Ciao');
    expect(mockSetFileName).toHaveBeenCalledWith('appunti_studio');
    expect(mockMarkSaved).toHaveBeenCalled();
    expect(mockOnFileLoaded).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('File "appunti_studio.md" caricato!');
  });

  
  it('gestisce correttamente lo stato isUploading (Spinner)', async () => {
    const { result } = renderHook(() => useFileUpload(mockOnFileLoaded));
    const validFile = new File(['test'], 'appunti.md', { type: 'text/markdown' });
    
    expect(result.current.isUploading).toBe(false);

    let uploadPromise: Promise<void>;
    
    act(() => {
      uploadPromise = result.current.uploadFile(validFile);
    });
    
    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      await uploadPromise;
    });

    expect(result.current.isUploading).toBe(false);
  });
});