// istanza di Axios (Facade) con configurazione centralizzata e interceptor per normalizzazione errori
// gestisce errori di rete, HTTP specifici e cancellazione richieste (RO-F-42)
// esporta un client API riutilizzabile in tutta l'app, semplificando chiamate HTTP e gestione errori
// src/lib/apiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

//interfaccia per la struttura degli errori restituiti dal backend
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * funzione pura: trasforma un errore Axios in un oggetto Error standard con messaggi leggibili
 * Usiamo 'any' per l'input per permettere a axios.isCancel di lavorare correttamente senza conflitti di tipo 
 * circolari. Testabile in isolamento, senza mockare axios.
 */
export const transformApiError = (error: AxiosError<ApiError>): Error => {
  //gestione AbortSignal / cancellazione richiesta
  if (axios.isCancel(error)) {
    const cancelError = new Error('Operazione annullata dall\'utente');
    cancelError.name = 'CanceledError';
    return cancelError;
  }

    //cast sicuro a AxiosError per accedere alle proprietà specifiche
    const axiosError = error as AxiosError<ApiError>;
    let message = 'Errore di comunicazione con il server';


    //errori di rete
    if (axiosError.code === 'ERR_NETWORK') {
      message = 'Connessione al server non disponibile';
    } 
    //errori HTTP basati sullo status code
    else if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status === 400) {
        message = data?.message || 'Richiesta non valida';
      } else if (status === 404) {
        message = 'Risorsa non trovata';
      } else if (status === 500) {
        message = data?.message || 'Errore interno del server';
      } else if (axiosError.message) {
        message = axiosError.message;
      }
    } 
    //fallback estremo
    else if (axiosError.message) {
      message = axiosError.message;
    }

    return new Error(message);
  };


// configurazione centrale dell'istanza Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
// Number('') restituisce 0 (che è falsy), quindi se la env var esiste ma è vuota, il fallback a 30000 scatterà comunque correttamente.
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: { 'Content-Type': 'application/json' },
});

// interceptor che delega alla funzione pura
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(transformApiError(error))
);

export default apiClient;