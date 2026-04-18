import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HistoryPage } from './HistoryPage';
import { useHistory } from '../hooks/useHistory';

//mock del ViewModel (Hook) - restituisce tutte le entries
vi.mock('../hooks/useHistory', () => ({
  useHistory: vi.fn(),
}));


const mockEntries = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    operation: 'summary',
    model: 'llama3.2',
    inputText: 'Pane e burro',
    generatedText: 'Colazione',
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    operation: 'translate_it',
    model: 'llama3.2',
    inputText: 'Bread and butter',
    generatedText: 'Pane e burro',
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  //l'hook restituisce la lista completa non filtrata
  (useHistory as any).mockReturnValue({
    entries: mockEntries,
    isLoading: false,
    error: null,
    deleteEntry: vi.fn(),
  });
});


test('passa il testo di ricerca al ViewModel quando l\'utente scrive', () => {
  render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );
  
  const searchInput = screen.getByPlaceholderText(/cerca/i);
  fireEvent.change(searchInput, { target: { value: 'Bread' } });

  // Verifica che il ViewModel (l'hook) riceva il filtro 'Bread'
  expect(useHistory).toHaveBeenLastCalledWith(
    expect.objectContaining({ search: 'Bread' })
  );
});


test('passa l\'operazione al ViewModel quando l\'utente usa la select', () => {
  render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );

  const select = screen.getByRole('combobox');
  fireEvent.change(select, { target: { value: 'summary' } });

  // Verifica che il ViewModel (l'hook) riceva il filtro 'summary'
  expect(useHistory).toHaveBeenLastCalledWith(
    expect.objectContaining({ operation: 'summary' })
  );
});


//Verifica che la pagina passi correttamente lo stato di isLoading dell'hook al componente HistoryList e che quindi mostri LoadingState
test('mostra il messaggio di caricamento se l\'hook è in loading', () => {
  (useHistory as any).mockReturnValue({
    entries: [],
    isLoading: true,
    error: null,
    deleteEntry: vi.fn(),
  });

  render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );
  expect(screen.getByRole('status')).toBeInTheDocument();
});

//Verifica l'eliminazione partita da una card arrivi correttamente alla funzione deleteEntry fornita dall'hook
test('chiama deleteEntry quando viene eliminata una card', () => {
  const mockDelete = vi.fn();
  (useHistory as any).mockReturnValue({
    entries: [mockEntries[0]],
    isLoading: false,
    error: null,
    deleteEntry: mockDelete,
  });

  render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>
  );
  
  const deleteBtn = screen.getByText(/elimina/i);
  fireEvent.click(deleteBtn);

  expect(mockDelete).toHaveBeenCalledWith('1');
});