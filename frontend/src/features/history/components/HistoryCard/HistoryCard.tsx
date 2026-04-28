import { useState, useEffect } from 'react';
import type { HistoryEntry } from '../../types/HistoryEntry';

import styles from './HistoryCard.module.css';


/* soglie di troncamento del testo */
const INPUT_TRUNCATE = 150;
const OUTPUT_TRUNCATE = 300;


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

  //reset del flag "Copiato" dopo 2 secondi, cleanup per evitare memory leak
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);
 
  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.generatedText);
    setCopied(true);
  };


    //testo input: tronca se supera la soglia e non è espanso
  const inputDisplay =
    expandedInput || item.inputText.length <= INPUT_TRUNCATE
      ? item.inputText
      : `${item.inputText.slice(0, INPUT_TRUNCATE)}...`;
 
  //testo output: tronca se supera la soglia e non è espanso
  const outputDisplay =
    expandedOutput || item.generatedText.length <= OUTPUT_TRUNCATE
      ? item.generatedText
      : `${item.generatedText.slice(0, OUTPUT_TRUNCATE)}...`;


  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <span className={styles.operationBadge} style={{ color, borderColor: color }}>
          {item.operation.replace('_', ' ')}       {/*Viene colorata solo la righetta della operation, non tutta la card*/}
        </span>
        <time className={styles.date}>{new Date(item.timestamp).toLocaleString('it-IT')}</time>
      </header>

      {/* BODY: testo input + testo generato */}
      <div className={styles.body}>

        {/* Testo originale inviato all'AI */}
        <p className={styles.inputText}>{inputDisplay}</p>
        {item.inputText.length > INPUT_TRUNCATE && (
          <button
            className={styles.toggleBtn}
            onClick={() => setExpandedInput((prev) => !prev)}
          >
            {expandedInput ? 'Mostra meno' : 'Mostra tutto'}
          </button>
        )}
 
        {/* Testo generato dall'AI */}
        <p className={styles.outputText}>{outputDisplay}</p>
        {item.generatedText.length > OUTPUT_TRUNCATE && (
          <button
            className={styles.toggleBtn}
            onClick={() => setExpandedOutput((prev) => !prev)}
          >
            {expandedOutput ? 'Mostra meno' : 'Mostra tutto'}
          </button>
        )}

      </div>

      <footer className={styles.footer}>
        <button className={styles.btnAction} onClick={handleCopy}>
          {copied ? '✓ Copiato' : 'Copia'}
        </button>
        <button
          className={`${styles.btnAction} ${styles.btnDelete}`}
          onClick={() => onDelete(item.id)}
        >
          Elimina
        </button>
      </footer>
    </article>
  );
};