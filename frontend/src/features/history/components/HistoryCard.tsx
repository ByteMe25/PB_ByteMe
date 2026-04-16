import React, { useState } from 'react';
import type { HistoryItem } from '../types/HistoryItem';

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
  item: HistoryItem;
  onDelete: (id: string) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ item, onDelete }) => {
  const [expandedInput, setExpandedInput] = useState(false); //per i mostra tutto, vedi sotto
  const [expandedOutput, setExpandedOutput] = useState(false);
  const [copied, setCopied] = useState(false); //per il copia, vedi sotto

  const color = OPERATION_COLORS[item.operation] ?? '#888';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); //dopo 2 sec rimette il bottone a "copia"
  };

  return (
    <article>
      <header>
        <span style={{ color, borderColor: color }}>
          {item.operation}        {/*Viene colorata solo la righetta della operation, non tutta la card*/}
        </span>
        <time>{new Date(item.timestamp).toLocaleString('it-IT')}</time>
      </header>


        <p>{expandedInput ? item.inputText : item.inputText.slice(0, 150)}</p>  {/*Aggiungere i 3 puntini??*/}
        {item.inputText.length > 150 && (
        <button onClick={() => setExpandedInput(prev => !prev)}>
            {expandedInput ? 'Mostra meno' : 'Mostra tutto'}
        </button>
        )}

        <p>{expandedOutput ? item.generatedText : item.generatedText.slice(0, 300)}</p>
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