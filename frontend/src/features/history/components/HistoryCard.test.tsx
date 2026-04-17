import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryCard } from '../components/HistoryCard';
import type { HistoryEntry } from '../types/HistoryEntry';

const mockItem: HistoryEntry = {
  id: '1',
  timestamp: '2024-01-01T10:00:00Z',
  operation: 'summary',
  model: 'llama3.2:3b',
  inputText: 'Testo originale',
  generatedText: 'Testo generato',
};

//Verifica che il tipo di operazione (es. summary) venga visualizzato correttamente nell'header della card
test('mostra operation e data', () => {
  render(<HistoryCard item={mockItem} onDelete={() => {}} />);
  expect(screen.getByText('summary')).toBeInTheDocument();
});


test('mostra il testo originale', () => {
  render(<HistoryCard item={mockItem} onDelete={() => {}} />);
  expect(screen.getByText(/Testo originale/i)).toBeInTheDocument();
});


test('mostra il testo generato', () => {
  render(<HistoryCard item={mockItem} onDelete={() => {}} />);
  expect(screen.getByText(/Testo generato/i)).toBeInTheDocument();
});


//Verifica che se i testi sono sotto la soglia (150/300 caratteri), il pulsante mostra tutto non deve esistere.
test('non mostra Mostra tutto se i testi sono corti', () => {
  render(<HistoryCard item={mockItem} onDelete={() => {}} />);
  expect(screen.queryByText('Mostra tutto')).not.toBeInTheDocument();
});

//Verifica che se il testo generato supera la soglia (150/300 caratteri) appaia il pulsante mostra tutto
test('mostra Mostra tutto se il testo generato è lungo', () => {
  const longItem = { ...mockItem, generatedText: 'x'.repeat(301) };
  render(<HistoryCard item={longItem} onDelete={() => {}} />);
  expect(screen.getByText('Mostra tutto')).toBeInTheDocument();
});

//Simula il click dell'utente sul tasto mostra tutto e verifica che l'etichetta del tasto cambi in mostra meno
test('espande il testo generato quando clicchi Mostra tutto', () => {
  const longText = 'x'.repeat(301);
  const longItem = { ...mockItem, generatedText: longText };
  render(<HistoryCard item={longItem} onDelete={() => {}} />);

  fireEvent.click(screen.getByText('Mostra tutto'));
  expect(screen.getByText('Mostra meno')).toBeInTheDocument();
});

//Verifica che la funzione delete cancelli la generazione giusta
test('chiama onDelete con id corretto', () => {
  const mockDelete = vi.fn();
  render(<HistoryCard item={mockItem} onDelete={mockDelete} />);

  fireEvent.click(screen.getByText('Elimina'));
  expect(mockDelete).toHaveBeenCalledWith('1');
});


//fakeTimers per gestire il warning di act()
test('copia il testo negli appunti', async () => {
  vi.useFakeTimers(); // "Congela" il tempo per i test
  const writeTextMock = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

  render(<HistoryCard item={mockItem} onDelete={() => {}} />);
  
  const copyBtn = screen.getByText(/copia/i);
  await fireEvent.click(copyBtn);

  expect(writeTextMock).toHaveBeenCalledWith('Testo generato');
  
  // Mandiamo avanti il tempo di 2 secondi in modo sicuro
  vi.runAllTimers(); 
  vi.useRealTimers(); // Ripristina il tempo normale
});