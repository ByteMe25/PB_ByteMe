import { useHistoryStore } from '../stores/HistoryStore';

export const useHistory = () => {
  const entries = useHistoryStore(state => state.entries);
  const deleteEntry = useHistoryStore(state => state.deleteEntry);

  return { entries, isLoading: false, error: null, deleteEntry };
};