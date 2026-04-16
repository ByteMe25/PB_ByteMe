import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryPage } from './HistoryPage';
import { useHistory } from '../hooks/useHistory';

//Mock di use useHistory
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
});

//Verifica che scrivendo nell'input, la lista si aggiorni mostrando solo gli elementi che contengono quella stringa (nel testo originale o generato)
test('filtra gli elementi tramite la barra di ricerca', () => {
  (useHistory as any).mockReturnValue({
    entries: mockEntries,
    isLoading: false,
    error: null,
    deleteEntry: vi.fn(),
  });

  render(<HistoryPage />);

  const searchInput = screen.getByPlaceholderText(/cerca/i);
  
  fireEvent.change(searchInput, { target: { value: 'Bread' } });

  expect(screen.queryByText('summary')).not.toBeInTheDocument();
  expect(screen.getByText('translate_it')).toBeInTheDocument();
});

//Verifica che vengano visualizzate solo le operazioni corrispondenti (es. summary in questo caso).
test('filtra gli elementi tramite il selettore operazione', () => {
  (useHistory as any).mockReturnValue({
    entries: mockEntries,
    isLoading: false,
    error: null,
    deleteEntry: vi.fn(),
  });

  render(<HistoryPage />);

  const select = screen.getByRole('combobox');
  
  fireEvent.change(select, { target: { value: 'summary' } });

  expect(screen.getByText('summary')).toBeInTheDocument();
  expect(screen.queryByText('translate_it')).not.toBeInTheDocument();
});

//Verifica che la pagina passi correttamente lo stato di isLoading dell'hook al componente HistoryList e che quindi mostri LoadingState
test('mostra il messaggio di caricamento se l\'hook è in loading', () => {
  (useHistory as any).mockReturnValue({
    entries: [],
    isLoading: true,
    error: null,
    deleteEntry: vi.fn(),
  });

  render(<HistoryPage />);
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

  render(<HistoryPage />);
  
  const deleteBtn = screen.getByText(/elimina/i);
  fireEvent.click(deleteBtn);

  expect(mockDelete).toHaveBeenCalledWith('1');
});