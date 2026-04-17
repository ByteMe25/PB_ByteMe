import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HistoryList } from './HistoryList';
import type { HistoryEntry } from '../../types/HistoryEntry';

//Due perchè testiamo HistoryList
const mockItems: HistoryEntry[] = [
  {
    id: '1',
    timestamp: '2024-01-01T10:00:00Z',
    operation: 'summary',
    model: 'llama3.2:3b',
    inputText: 'Input 1',
    generatedText: 'Output 1',
  },
  {
    id: '2',
    timestamp: '2024-01-01T11:00:00Z',
    operation: 'fix_grammar',
    model: 'llama3.2:3b',
    inputText: 'Input 2',
    generatedText: 'Output 2',
  }
];

//Verifica che, quando isLoading è true, venga visualizzato il componente LoadingState
test('mostra lo stato di caricamento (loading)', () => {
  render(<HistoryList items={[]} isLoading={true} error={null} onDelete={() => {}} />);
  const loader = screen.getByRole('status');
  expect(loader).toBeInTheDocument();
});

//Verifica che il componente ErrorState appaia quando viene passata una stringa di errore, mostrando il messaggio corretto
test('mostra lo stato di errore', () => {
  const errorMessage = "Connessione fallita";
  render(<HistoryList items={[]} isLoading={false} error={errorMessage} onDelete={() => {}} />);
  expect(screen.getByText(`Errore nel caricamento: ${errorMessage}`)).toBeInTheDocument();
});

//Verifica che, se non ci sono elementi e non stiamo caricando, venga visualizzato il componente EmptyState
test('mostra il messaggio di lista vuota', () => {
  render(<HistoryList items={[]} isLoading={false} error={null} onDelete={() => {}} />);
  expect(screen.getByText(/Le tue generazioni AI appariranno qui/i)).toBeInTheDocument();
});

//Verifica che, passando una lista di card, il componente generi una lista e renderizzi i componenti HistoryCard al suo interno
test('mostra correttamente la lista di card', () => {
  render(<HistoryList items={mockItems} isLoading={false} error={null} onDelete={() => {}} />);
  
  expect(screen.getByText('summary')).toBeInTheDocument();
  expect(screen.getByText('fix_grammar')).toBeInTheDocument();
  
  expect(screen.getByRole('list', { name: /storico generazioni/i })).toBeInTheDocument();
});

//Verifica che quando l'utente interagisce con una singola card nella lista, l'eliminazione risalga correttamente fino al componente padre con l'ID giusto.
test('passa la funzione onDelete correttamente alle card', () => {
  const mockDelete = vi.fn();
  render(<HistoryList items={mockItems} isLoading={false} error={null} onDelete={mockDelete} />);
  
  const deleteButtons = screen.getAllByText(/elimina/i);
  deleteButtons[0].click();
  
  expect(mockDelete).toHaveBeenCalledWith('1');
});