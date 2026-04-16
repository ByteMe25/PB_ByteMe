import { test, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHistory } from '../hooks/useHistory';
import { useHistoryStore } from '../stores/HistoryStore';

//Mock di HistoryStore
vi.mock('../stores/HistoryStore', () => ({
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