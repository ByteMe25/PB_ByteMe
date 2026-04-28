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

//componenti di stato separati oer migliore leggibilità
const EmptyState = () => (
  <div className={styles.emptyState}>
    <p>Le tue generazioni AI appariranno qui dopo la prima richiesta dall'editor.</p>
  </div>
);


const LoadingState = () => (
  <div className={styles.loadingState} role="status" aria-label="Caricamento in corso">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className={styles.skeletonCard}>
        <div className={styles.skeletonHeader} /> {/* skeleton implementato in css */}
        <div className={styles.skeletonBody} />
        <div className={styles.skeletonFooter} />
      </div>
    ))}
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className={styles.errorState} role="alert">
    <p>Errore nel caricamento: {message}</p>
  </div>
);

export const HistoryList = ({ items, isLoading, error, onDelete }: HistoryListProps) => {
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (items.length === 0) return <EmptyState />;
 
  return (
    <ul className={styles.list} aria-label="Storico generazioni">
      {items.map((item) => (
        <li key={item.id}>
          <HistoryCard item={item} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
};