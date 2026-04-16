import React from 'react';
import type { HistoryItem } from '../types/HistoryItem';
import { HistoryCard } from './HistoryCard';


interface HistoryListProps {
  items: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
}

//Per ogni stato appaiono cose diverse, si può semplificare solo con gli if ma così è più separato e chiaro

const EmptyState: React.FC = () => (
    <div className="emptyState"> {/*Questi div non hanno uno scopo, sono lì se servono per il css*/}
        <p>Le tue generazioni AI appariranno qui dopo la prima richiesta dall'editor.</p>
    </div>
);

const LoadingState: React.FC = () => (
  <div className="loadingState" role="status" aria-label="Caricamento in corso"> 
    {Array.from({ length: 3 }).map((_, i) => ( 
      <div key={i}>
        <div />  {/*skeleton loader, bisogna poi farlo effettivamente con il css*/}
        <div />  {/*sono 3 elementi di caricamento, se ne possono aggiungere, basta mettere length: x sopra*/}
        <div />
      </div>
    ))}
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="errorState" role="alert">
    <p>Errore nel caricamento: {message}</p>
  </div>
);


export const HistoryList: React.FC<HistoryListProps> = ({items, isLoading, error, onDelete}) => {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (items.length === 0) return <EmptyState />;

  return (
    <ul className="history-list" aria-label="Storico generazioni">
      {items.map(item => (
        <li key={item.id} className="history-list__item">
          <HistoryCard item={item} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
};
