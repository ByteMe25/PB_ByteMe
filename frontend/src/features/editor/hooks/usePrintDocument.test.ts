import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePrintDocument } from './usePrintDocument';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('usePrintDocument (ViewModel)', () => {
  const mockGetContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());


  it('espone la funzione handlePrint', () => {
    const { result } = renderHook(() => usePrintDocument(mockGetContent));
    expect(typeof result.current.handlePrint).toBe('function');
  });


  it('chiama window.print() se il documento non è vuoto', () => {
    mockGetContent.mockReturnValue('# Documento di test');
    const { result } = renderHook(() => usePrintDocument(mockGetContent));
    
    result.current.handlePrint();
    
    expect(window.print).toHaveBeenCalledTimes(1);
  });


  it('blocca la stampa e mostra errore se il documento è vuoto', () => {
    mockGetContent.mockReturnValue('   ');
    const { result } = renderHook(() => usePrintDocument(mockGetContent));
    
    result.current.handlePrint();
    
    expect(window.print).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Il documento è vuoto. Niente da stampare.');
  });

  
  it('gestisce errori imprevisti durante window.print() (RO-F-80)', () => {
    mockGetContent.mockReturnValue('# Test');
    vi.spyOn(window, 'print').mockImplementation(() => { throw new Error('Print blocked'); });
    
    const { result } = renderHook(() => usePrintDocument(mockGetContent));
    result.current.handlePrint();
    
    expect(toast.error).toHaveBeenCalledWith('Impossibile avviare la stampa. Verifica le impostazioni del browser.');
  });
});