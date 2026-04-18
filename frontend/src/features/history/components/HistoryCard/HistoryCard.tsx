import { useState, useEffect } from 'react';
import type { HistoryEntry } from '../../types/HistoryEntry';

import styles from './HistoryCard.module.css';


//Mappa per associare a ogni operazione un colore
const OPERATION_COLORS: Record<string, string> = {
  summary: '#4A90D9',
  fix_grammar: '#7B68EE',
  rewrite: '#20B2AA',
  distant_writing: '#3CB371',
  white_hat: '#B0B0B0',
  red_hat: '#E05252',
  black_hat: '#555555',
  yellow_hat: '#D4A017',
  green_hat: '#4CAF50',
  blue_hat: '#2196F3',
  translate_it: '#FF8C42',
  translate_en: '#FF8C42',
  translate_es: '#FF8C42',
  translate_fr: '#FF8C42',
  translate_de: '#FF8C42',
  translate_zh: '#FF8C42',
};

interface HistoryCardProps {
  item: HistoryEntry;
  onDelete: (id: string) => void;
}


export const HistoryCard = ({ item, onDelete }: HistoryCardProps) => {
  const [expandedInput, setExpandedInput] = useState(false); //per i mostra tutto, vedi sotto
  const [expandedOutput, setExpandedOutput] = useState(false);
  const [copied, setCopied] = useState(false); //per il copia, vedi sotto

  const color = OPERATION_COLORS[item.operation] ?? '#888';

  //useEffect per il memory leak è tornato al suo posto
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (copied) {
      timeoutId = setTimeout(() => setCopied(false), 2000);
    }
    return () => clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.generatedText);
    setCopied(true);
  };

  return (
    <article>
      <header>
        <span style={{ color, borderColor: color }}>
          {item.operation}        {/*Viene colorata solo la righetta della operation, non tutta la card*/}
        </span>
        <time>{new Date(item.timestamp).toLocaleString('it-IT')}</time>
      </header>


        <p>{expandedInput || item.inputText.length <= 150 ? item.inputText : `${item.inputText.slice(0, 150)}...`}</p> {/*aggiunti 3 puntini*/}
      {item.inputText.length > 150 && (
        <button onClick={() => setExpandedInput(prev => !prev)}>
          {expandedInput ? 'Mostra meno' : 'Mostra tutto'}
        </button>
      )}

        <p>{expandedOutput || item.generatedText.length <= 300 ? item.generatedText : `${item.generatedText.slice(0, 300)}...`}</p>
      {item.generatedText.length > 300 && (
        <button onClick={() => setExpandedOutput(prev => !prev)}>
          {expandedOutput ? 'Mostra meno' : 'Mostra tutto'}
        </button>
      )}

      <footer>
        <button onClick={handleCopy}> {copied ? '✓ Copiato' : 'Copia'} </button>
        <button onClick={() => onDelete(item.id)}> Elimina </button>
      </footer>
    </article>
  );
};