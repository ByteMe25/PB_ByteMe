import { useMemo } from 'react';
import { useHistoryStore } from '../store/useHistoryStore';


//logica per il filtraggio
export interface HistoryFilters {
  search?: string;
  operation?: string;
}


export const useHistory = (filters: HistoryFilters = {}) => {
  //estrae i dati grezzi senza ordinarli qui
  const rawEntries = useHistoryStore((state) => state.entries);
  const deleteEntry = useHistoryStore((state) => state.deleteEntry);

  //ordinamento e filtraggio nel useMemo
  const filteredEntries = useMemo(() => {
    let result = [...rawEntries];

    //filtra per operazione
    if (filters.operation) {
      result = result.filter(item => item.operation === filters.operation);
    }

    //filtra per ricerca
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(item =>
        item.inputText.toLowerCase().includes(term) ||
        item.generatedText.toLowerCase().includes(term)
      );
    }

    //ordina cronologicamente alla fine
    return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [rawEntries, filters.search, filters.operation]);

  return { 
    entries: filteredEntries, 
    isLoading: false, 
    error: null, 
    deleteEntry 
  };
};