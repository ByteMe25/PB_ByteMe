import React, { useState } from 'react';
import { HistoryList } from '../components/HistoryList';
import { useHistory } from '../hooks/useHistory';

export const HistoryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [operation, setOperation] = useState('');

  const { entries, isLoading, error, deleteEntry } = useHistory();

  const filteredItems = entries
    .filter(item => !operation || item.operation === operation)
    .filter(item => !search || item.inputText.includes(search) || item.generatedText.includes(search));

  return (
    <div>
      <h1>Storico generazioni</h1>

      <input
        type="search"
        placeholder="Cerca..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <select value={operation} onChange={e => setOperation(e.target.value)}>
        <option value="">Tutte</option>
        <option value="summary">Riassunto</option>
        <option value="fix_grammar">Correzione grammatica</option>
        <option value="rewrite">Riscrittura</option>
        <option value="distant_writing">Scrittura distante</option>
        <option value="white_hat">Cappello Bianco</option>
        <option value="red_hat">Cappello Rosso</option>
        <option value="black_hat">Cappello Nero</option>
        <option value="yellow_hat">Cappello Giallo</option>
        <option value="green_hat">Cappello Verde</option>
        <option value="blue_hat">Cappello Blu</option>
        <option value="translate_it">Traduzione IT</option>
        <option value="translate_en">Traduzione EN</option>
        <option value="translate_es">Traduzione ES</option>
        <option value="translate_fr">Traduzione FR</option>
        <option value="translate_de">Traduzione DE</option>
        <option value="translate_zh">Traduzione ZH</option>
      </select>

      <HistoryList
        items={filteredItems}
        isLoading={isLoading}
        error={error}
        onDelete={deleteEntry}
      />
    </div>
  );
};