// test per apiClient.ts - verifica configurazione, interceptor, supporto AbortSignal e type-safety
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient, { transformApiError, ApiError } from './apiClient';
import axios, {AxiosError} from 'axios';


//invece di fare chiamate HTTP finte (mock di axios), testa direttamente l'interceptor:
//passiamo oggetti JavaScript semplici (stub) forzandone il tipo con `as AxiosError`
describe('transformApiError (logica interceptor pura)', () => {
  it('gestisce errore di cancellazione (ERR_CANCELED)', () => {
    //crea un vero errore di cancellazione nativo di Axios così axios.isCancel(error) restituisce true
    const error = new axios.CanceledError('canceled') as any;
    
    const result = transformApiError(error);
    
    expect(result.name).toBe('CanceledError');
    expect(result.message).toBe('Operazione annullata dall\'utente');
  });


  it('gestisce errore di rete (ERR_NETWORK)', () => {
    const error = {
      code: 'ERR_NETWORK',
      message: 'Network Error',
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('Connessione al server non disponibile');
  });


  //simula la struttura che Python (FastAPI) restituirebbe per un 400
  it('gestisce errore 400 con messaggio custom dal backend', () => {
    const error = {
      code: undefined,
      response: {
        status: 400,
        data: { message: 'Il prompt non può essere vuoto' },
      },
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('Il prompt non può essere vuoto');
  });

  it('usa fallback per errore 400 senza messaggio backend', () => {
    const error = {
      code: undefined,
      response: { status: 400, data: {} },
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('Richiesta non valida');
  });


  it('gestisce errore 404', () => {
    const error = {
      code: undefined,
      response: {
        status: 404,
        data: { message: 'Not Found' },
      },
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('Risorsa non trovata');
  });


  it('gestisce errore 500 con messaggio custom', () => {
    const error = {
      code: undefined,
      response: {
        status: 500,
        data: { message: 'LLM timeout' },
      },
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('LLM timeout');
  });


  it('usa messaggio generico per errori non classificati', () => {
    const error = {
      code: undefined,
      response: {
        status: 418, // Teapot
        data: {},
      },
      message: 'I\'m a teapot',
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('I\'m a teapot');
  });


  //caso peggiore: il server esplode e non manda né data né message
  it('usa fallback generico se nessun messaggio disponibile', () => {
    const error = {
      code: undefined,
      response: {
        status: 418,
        data: {},
      },
    } as AxiosError<ApiError>;
    
    const result = transformApiError(error);
    expect(result.message).toBe('Errore di comunicazione con il server');
  });
});


describe('apiClient configurazione base', () => {
  beforeEach(() => {
    //isola le variabili d'ambiente per il test
    vi.stubEnv('VITE_API_BASE_URL', '/api');
    vi.stubEnv('VITE_API_TIMEOUT', '30000');

    //forza il reload del modulo per leggere le nuove env
    vi.resetModules();
  });

  //pulizia totale dopo ogni test per evitare "leak" di variabili d'ambiente
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ha baseURL configurata da env', async () => {
    const { default: client } = await import('./apiClient');
    expect(client.defaults.baseURL).toBe('/api');
  });

  it('ha timeout configurato da env', async () => {
    const { default: client } = await import('./apiClient');
    expect(client.defaults.timeout).toBe(30000);
  });
});