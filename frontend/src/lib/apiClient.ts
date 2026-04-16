// istanza di Axios (Facade) con configurazione centralizzata e interceptor per normalizzazione errori
// gestisce errori di rete, HTTP specifici e cancellazione richieste (RO-F-42)
// esporta un client API riutilizzabile in tutta l'app, semplificando chiamate HTTP e gestione errori

import axios, { AxiosInstance, AxiosError } from 'axios';

//interfaccia per la struttura degli errori restituiti dal backend
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

//funzione pura: trasforma un AxiosError in un Error leggibile, testabile in isolamento, senza mockare axios
export const transformApiError = (error: AxiosError<ApiError>): Error => {
  //gestione AbortSignal / cancellazione richiesta
  if (error.code === 'ERR_CANCELED' || axios.isCancel(error)) {
    const cancelError = new Error('Operazione annullata dall\'utente');
    cancelError.name = 'CanceledError';
    return cancelError;
  }


    let message = 'Errore di comunicazione con il server';

    //errori di rete
    if (error.code === 'ERR_NETWORK') {
      message = 'Connessione al server non disponibile';
    
    //errori HTTP specifici
    } else if (error.response?.status === 400) {
      //bad Request: validazione fallita, prompt vuoto, testo troppo breve, ecc.
      message = error.response.data?.message || 'Richiesta non valida';
    } else if (error.response?.status === 404) {
      message = 'Risorsa non trovata';
    } else if (error.response?.status === 500) {
      message = error.response.data?.message || 'Errore interno del server';
    
    //fallback su messaggio Axios generico
    } else if (error.message) {
      message = error.message;
    }

    return new Error(message);
  }


//configurazione centrale dell'istanza Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
});

//interceptor che delega alla funzione pura
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => Promise.reject(transformApiError(error))
);

export default apiClient;