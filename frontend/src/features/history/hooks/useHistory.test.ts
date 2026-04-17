import { test, expect, vi, describe, beforeEach, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHistory } from '../hooks/useHistory';
import { useHistoryStore } from '../store/useHistoryStore';

//Mock di useHistoryStore
vi.mock('../store/useHistoryStore', () => ({
  useHistoryStore: vi.fn(),
}));


//Verifica che l'hook estragga correttamente l'array entries dallo store e restituisca gli stati predefiniti di isLoading (false) e error (null)
test('ritorna i dati corretti dallo store', () => {
  const mockEntries = [{ id: '1', operation: 'summary', inputText: 'test', generatedText: 'test' }];
  
  (useHistoryStore as any).mockImplementation((selector: any) => 
    selector({ entries: mockEntries, deleteEntry: vi.fn() })
  );

  const { result } = renderHook(() => useHistory());

  expect(result.current.entries).toEqual(mockEntries);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBe(null);
});

//Verifica che la funzione deleteEntry restituita dall'hook sia effettivamente collegata alla logica definita nel useHistoryStore
test('ritorna la funzione deleteEntry dallo store', () => {
  const mockDelete = vi.fn();
  
  (useHistoryStore as any).mockImplementation((selector: any) => 
    selector({ entries: [], deleteEntry: mockDelete })
  );

  const { result } = renderHook(() => useHistory());

  result.current.deleteEntry('1');
  expect(mockDelete).toHaveBeenCalledWith('1');
});


//test per filtri
describe('useHistory (ViewModel)', () => {
  const mockEntries = [
    { id: '1', operation: 'summary', inputText: 'Testo lungo', generatedText: 'Riassunto' },
    { id: '2', operation: 'translate_en', inputText: 'Hello', generatedText: 'Ciao' },
  ];

  beforeEach(() => {
    vi.mocked(useHistoryStore).mockImplementation((selector: any) => 
      selector({ entries: mockEntries, deleteEntry: vi.fn() })
    );
  });

  it('filtra per operazione', () => {
    const { result } = renderHook(() => useHistory({ operation: 'summary' }));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].operation).toBe('summary');
  });

  it('filtra per ricerca (case-insensitive)', () => {
    const { result } = renderHook(() => useHistory({ search: 'hello' }));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].id).toBe('2');
  });
});