import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HistoryList } from '../components/HistoryList/HistoryList';
import { useHistory } from '../hooks/useHistory';

//componenti
import { Topbar } from '../../../components/Topbar/Topbar';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
//store
import { useEditorMetaStore } from '../../editor/store/useEditorMetaStore';

import styles from './HistoryPage.module.css';
import editorLayoutStyles from '../../editor/pages/EditorPage.module.css';


export const HistoryPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [operation, setOperation] = useState('');

  //nome del documento attualmente aperto (topbar)
  const fileName = useEditorMetaStore((state) => state.fileName);

  //la View delega tutto al ViewModel - no filter/sort qui
  const { entries, isLoading, error, deleteEntry } = useHistory({ search, operation });

  return (
    <div className={editorLayoutStyles.layout}>
      {/* TOPBAR */}
      <Topbar 
        documentName={fileName}
        onDocumentNameChange={() => {}} //disabilitato nello storico
        onCloseDocument={() => navigate('/')} 
      />

      <div className={editorLayoutStyles.body}>
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
        <main className={styles.container}>
          
          {/* wrapper dei filtri per mantenere l'impaginazione del CSS */}
          <div className={styles.filters}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Cerca testo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={operation} onChange={e => setOperation(e.target.value)}>
            <option value="">Tutte</option>
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