//modulo che fa da Facade per le chiamate AI dell'Editor, fornendo un'interfaccia semplice e coerente
import apiClient from '../../../lib/apiClient';

//mappatura operazioni AI - con OPERATION_MAPPER del backend (app.py)
export type AiOperationId = 
  | 'summary' 
  | 'rewrite' 
  | 'fix_grammar' 
  | 'distant_writing'
  | 'white_hat' | 'red_hat' | 'black_hat' | 'yellow_hat' | 'green_hat' | 'blue_hat'
  | 'translate_it' | 'translate_en' | 'translate_es' | 'translate_fr' | 'translate_de' | 'translate_zh';


  //interfaccia interna, non esportata (incapsulamento)
export interface AiRequestPayload {
  operationId: AiOperationId;
  text: string;
  prompt?: string; //opzionale, solo per distant_writing
}

interface AiResponse {
  generated_text: string;
}

export const aiCall = {
    /**
   * Esegue un'operazione AI sul testo fornito, utilizzando l'endpoint /ai/generate del backend
   * Il payload deve includere l'operationId (tipo di operazione) e il testo su cui operare
   * @param payload - I dati dell'operazione (tipo, testo, parametri extra)
   * @param signal - Opzionale: AbortSignal per annullare la richiesta in corso
   * @returns La stringa di testo generata dall'LLM
   */
  executeOperation: async (payload: AiRequestPayload, signal?: AbortSignal): Promise<string> => { //tipo di ritorno esplicito
    const response = await apiClient.post<AiResponse>('/ai/generate', payload, {
      signal,
    });
    return response.data.generated_text;
  }
};