/* Pagina dello Storico delle generazioni AI
 *  - Mostra la lista delle generazioni con filtri (search, operation)
 *  - Condivide Topbar e Sidebar con EditorPage per coerenza UI
 *  - Delega la logica di filtraggio/ordinamento al ViewModel useHistory
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//viewModel
import { useHistory } from '../hooks/useHistory';
//model (solo lettura del fileName per la Topbar)
import { useEditorMetaStore } from '../../editor/store/useEditorMetaStore';
//componenti view
import { Topbar } from '../../../components/Topbar/Topbar';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { HistoryList } from '../components/HistoryList/HistoryList';
 
import styles from './HistoryPage.module.css';

export const HistoryPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [operation, setOperation] = useState('');

  //nome del documento attualmente aperto (topbar)
  const fileName = useEditorMetaStore((state) => state.fileName);

  //la View delega tutto al ViewModel - no filter/sort qui
  const { entries, isLoading, error, deleteEntry } = useHistory({ search, operation });

  return (
    <div className={styles.layout}>
      {/* TOPBAR */}
      <Topbar 
        documentName={fileName}
        onDocumentNameChange={() => {}} //disabilitato nello storico
        onCloseDocument={() => navigate('/')} 
      />

      <div className={styles.body}>
        {/* SIDEBAR */}
        <Sidebar 
          activePage="history" 
          onNavigate={(page) => {
            if (page === 'editor') navigate('/');
          }}
          onUpload={() => {}} 
          onSave={() => {}}
          onPrint={() => {}}
          onAiAction={() => {}}
        />

        {/* main: contiene i filtri e la lista */}
        <main className={styles.main}>
          
          {/* wrapper dei filtri per mantenere l'impaginazione del CSS */}
          <div className={styles.filters}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Cerca testo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          <select
              className={styles.selectInput}
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
            <option value="">Tutte le operazioni</option>
            <option value="summary">Riassunto</option>
            <option value="fix_grammar">Correzione grammatica</option>
            <option value="rewrite">Riscrittura</option>
            <option value="distant_writing">Distant Writing</option>
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
          </div>

          {/* Lista generazioni — delega rendering a HistoryList */}
          <div className={styles.contentWrapper}>
            <HistoryList
              items={entries}
              isLoading={isLoading}
              error={error}
              onDelete={deleteEntry}
            />
          </div>
          
        </main>

      </div>
    </div>
  );
};