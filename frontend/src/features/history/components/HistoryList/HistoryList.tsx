import React from 'react';
import type { HistoryEntry } from '../../types/HistoryEntry';
import { HistoryCard } from '../HistoryCard/HistoryCard';

import styles from './HistoryList.module.css';


interface HistoryListProps {
  items: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
}

//Per ogni stato appaiono cose diverse, si può semplificare solo con gli if ma così è più separato e chiaro
const EmptyState = () => (
  <div className="emptyState"> {/*Questi div non hanno uno scopo, servono per il css*/}
    <p>Le tue generazioni AI appariranno qui dopo la prima richiesta dall'editor.</p>
  </div>
);


const LoadingState = () => (
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

const ErrorState = ({ message }: { message: string }) => (
  <div className="errorState" role="alert">
    <p>Errore nel caricamento: {message}</p>
  </div>
);

export const HistoryList = ({ items, isLoading, error, onDelete }: HistoryListProps) => {
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