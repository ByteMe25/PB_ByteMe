import { test, expect, beforeEach } from 'vitest';
import { useHistoryStore } from './useHistoryStore';

// Dati finti riusabili nei test
const mockEntry = {
  operation: 'summary',
  model: 'llama3.2:3b',
  inputText: 'Testo originale',
  generatedText: 'Testo generato',
};

//Resetta lo store prima di ogni test
beforeEach(() => {
  useHistoryStore.setState({ entries: [] });
});

//Verifica che, quando l'app viene aperta per la prima volta, l'elenco della cronologia non contenga 
//dati residui.
test('store inizia vuoto', () => {
  const { entries } = useHistoryStore.getState();
  expect(entries).toHaveLength(0);
});

//Controlla che addentry funzioni. Inserisce un elemento finto (mockEntry) e verifica che la lista passi 
//da 0 a 1 elemento e che i dati salvati (come l'operazione "summary") siano corretti.
test('addEntry aggiunge una generazione', () => {
  useHistoryStore.getState().addEntry(mockEntry);

  const { entries } = useHistoryStore.getState();
  expect(entries).toHaveLength(1);
  expect(entries[0].operation).toBe('summary');
});

//Verifica che lo Store crei da solo un identificativo unico (id) e una data di registrazione (timestamp) 
//per ogni riga.
test('addEntry genera id e timestamp automaticamente', () => {
  useHistoryStore.getState().addEntry(mockEntry);

  const entry = useHistoryStore.getState().entries[0];
  expect(entry.id).toBeDefined();
  expect(entry.timestamp).toBeDefined();
});

//Verifica l'ordinamento. Se fai un riassunto ora e uno tra due minuti, quello più recente deve apparire 
//per primo.
test('addEntry mette la nuova generazione in cima', () => {
  useHistoryStore.getState().addEntry({ ...mockEntry, inputText: 'primo' });
  useHistoryStore.getState().addEntry({ ...mockEntry, inputText: 'secondo' });

  const { entries } = useHistoryStore.getState();
  expect(entries[0].inputText).toBe('secondo');
});

//Verifica deleteEntry. Aggiunge un elemento, recupera il suo ID appena creato e prova a cancellarlo. 
//Se alla fine la lista è di nuovo lunga 0, il test passa.
test('deleteEntry rimuove la generazione corretta', () => {
  useHistoryStore.getState().addEntry(mockEntry);
  const id = useHistoryStore.getState().entries[0].id;

  useHistoryStore.getState().deleteEntry(id);

  expect(useHistoryStore.getState().entries).toHaveLength(0);
});

//Verifica che, se elimini un elemento specifico, gli altri rimangano intatti, quindi aggiunge due elementi,
//ne elimina uno e verifica che ne sia rimasto esattamente uno e che sia quello che non volevi cancellare.
test('deleteEntry non rimuove le altre generazioni', () => {
  useHistoryStore.getState().addEntry({ ...mockEntry, inputText: 'primo' });
  useHistoryStore.getState().addEntry({ ...mockEntry, inputText: 'secondo' });
  const id = useHistoryStore.getState().entries[0].id; // prende il più recente

  useHistoryStore.getState().deleteEntry(id);

  const { entries } = useHistoryStore.getState();
  expect(entries).toHaveLength(1);
  expect(entries[0].inputText).toBe('primo');
});