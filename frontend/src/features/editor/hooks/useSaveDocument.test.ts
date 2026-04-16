import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSaveDocument } from './useSaveDocument';
import { downloadFile } from '../utils/fileHandler';
import { composeFilename } from '../utils/filenameUtils';
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import toast from 'react-hot-toast';
import type { ExportFormat } from '../types';

//mock delle Utilities
vi.mock('../utils/fileHandler', () => ({ downloadFile: vi.fn() }));

vi.mock('../utils/filenameUtils', () => ({
  composeFilename: vi.fn((name: string, ext: string) => `mocked_${name}.${ext}`),
}));

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

vi.mock('../store/useEditorMetaStore', () => ({
  useEditorMetaStore: { getState: vi.fn() },
}));


describe('useSaveDocument (ViewModel)', () => {
  const mockMarkSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEditorMetaStore.getState).mockReturnValue({ markSaved: mockMarkSaved } as any);
  });

  afterEach(() => vi.restoreAllMocks());


  it('inizializza con la modale chiusa e senza caricamenti in corso', () => {
    const { result } = renderHook(() => useSaveDocument());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isExporting).toBe(false);
  });


  it('permette di aprire e chiudere la modale', () => {
    const { result } = renderHook(() => useSaveDocument());
    act(() => result.current.openModal());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.closeModal());
    expect(result.current.isOpen).toBe(false);
  });


  it('coordina correttamente l\'esportazione, aggiorna lo store e chiude la modale', async () => {
    const { result } = renderHook(() => useSaveDocument());
    act(() => result.current.openModal());

    await act(async () => {
      await result.current.handleExport('Mio File', 'md' as ExportFormat, '# Titolo');
    });

    expect(composeFilename).toHaveBeenCalledWith('Mio File', 'md');
    expect(downloadFile).toHaveBeenCalledWith('# Titolo', 'mocked_Mio File.md', 'text/markdown');
    expect(mockMarkSaved).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Documento "mocked_Mio File.md" esportato con successo!');
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isExporting).toBe(false);
  });


  it(`imposta il mimetype corretto per l'HTML`, async () => {
    const { result } = renderHook(() => useSaveDocument());
    await act(async () => {
      await result.current.handleExport('Sito', 'html' as ExportFormat, '<h1>Titolo</h1>');
    });

    expect(downloadFile).toHaveBeenCalledWith('<h1>Titolo</h1>', 'mocked_Sito.html', 'text/html');
  });


  it('gestisce gli errori e lascia la modale aperta per riprovare', async () => {
    const { result } = renderHook(() => useSaveDocument());
    act(() => result.current.openModal());

    vi.mocked(downloadFile).mockImplementationOnce(() => {
      throw new Error('Errore di memoria');
    });

    await act(async () => {
      await result.current.handleExport('Test', 'md' as ExportFormat, 'test');
    });

    expect(toast.error).toHaveBeenCalledWith('Errore durante l\'esportazione del documento.');
    expect(result.current.isOpen).toBe(true); //non chiude in caso di errore
    expect(result.current.isExporting).toBe(false);
    expect(mockMarkSaved).not.toHaveBeenCalled(); //mantiene lo stato "sporco"
  });
});