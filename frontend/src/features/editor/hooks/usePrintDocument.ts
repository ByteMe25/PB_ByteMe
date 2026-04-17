/* hook per la gestione della stampa del documento: si occupa solo di aprire la finestra del browser
 * Soddisfa i requisiti:
 * - RD-F-15: Il sistema deve permettere all'utente di avviare la stampa del documento
 * - RO-F-75: La funzionalità di stampa non altera nè chiude il documento
 * - RO-F-76: Il sistema deve informare l’utente con un messaggio di esito al termine di ogni operazione di esportazione
 * - RO-F-79: Il sistema deve permettere di collegare e inviare il documento a un dispositivo di stampa
 * - RO-F-80: In caso di errori durante l'avvio della stampa, il sistema deve informare l'utente
 * - RO-F-78: Il sistema deve controllare che il range di pagine inserito dall’utente sia valido (non superiore al numero di pagine del documento e non negativo) - NON LO POSSIAMO CONTROLLARE
 * 
 * si poteva mettere direttamente dentro useEditor ma per Single Responsibility Principle è meglio separare le responsabilità
*/

import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const usePrintDocument = (getContent: () => string) => {
  const handlePrint = useCallback(() => {
    try {
      //validazione preventiva UX
      const content = getContent();
      if (!content.trim()) {
        toast.error('Il documento è vuoto. Niente da stampare.');
        return;
      }

      //apre il dialogo nativo del browser (blocca il thread fino a conferma/annullamento)
      window.print();
    } catch {
      toast.error('Impossibile avviare la stampa. Verifica le impostazioni del browser.');
    }
  }, [getContent]);

  return { handlePrint };
};