import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiCall } from './aiCall';
import apiClient from '../../../lib/apiClient';

//mock di apiClient (facade) per isolare i test di aiCall e verificare le chiamate senza fare richieste reali
// no mock di axios
vi.mock('../../../lib/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));


describe('aiCall - Operazioni AI (Facade)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invia correttamente una richiesta di riassunto', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ 
      data: { generated_text: 'Questo è il riassunto.' } 
    });

    const result = await aiCall.executeOperation({
      operationId: 'summary',
      text: 'Testo molto lungo',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/ai/generate', {
      operationId: 'summary',
      text: 'Testo molto lungo'
    }, expect.any(Object)); //config con signal opzionale
    
    expect(result).toBe('Questo è il riassunto.');
  });


  it('invia una richiesta di traduzione con la chiave di registro esatta del backend', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { generated_text: 'Hello' } });

    //passiamo direttamente 'translate_en' come si aspetta il backend
    await aiCall.executeOperation({
      operationId: 'translate_en',
      text: 'Ciao',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/ai/generate', {
      operationId: 'translate_en',
      text: 'Ciao',
    }, expect.any(Object));
  });


  it('propaga l\'AbortSignal per annullare la chiamata in corso', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { generated_text: 'ok' } });
    const controller = new AbortController();

    await aiCall.executeOperation(
      { operationId: 'fix_grammar', text: 'Testo sbagliato' },
      controller.signal
    );

    expect(apiClient.post).toHaveBeenCalledWith(
      '/ai/generate',
      expect.any(Object),
      { signal: controller.signal } //verifica che signal arrivi in config
    );
  });


  it('propaga gli errori normalizzati da apiClient', async () => {
    const mockError = new Error('Connessione al server non disponibile');
    vi.mocked(apiClient.post).mockRejectedValue(mockError);
  
    await expect(
      aiCall.executeOperation({ operationId: 'summary', text: 'test' })
    ).rejects.toThrow('Connessione al server non disponibile');
  });

  //per testare campi opzionali e specifici per operazioni particolari (distant_writing)
  it('inoltra il campo opzionale prompt per distant_writing', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: { generated_text: 'ok' } });
    
    await aiCall.executeOperation({
        operationId: 'distant_writing',
        text: '', 
        prompt: 'Scrivi un articolo sul React MVVM' //striga in input
    });

    expect(apiClient.post).toHaveBeenCalledWith(
        '/ai/generate',
        { operationId: 'distant_writing', text: '', prompt: 'Scrivi un articolo sul React MVVM' },
        expect.any(Object)
    );
  });
});