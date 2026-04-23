import React from 'react';
import { TextInitial, History, FileUp, Save, Printer, Sparkles } from 'lucide-react';
import { EditorButton } from '../EditorButton/EditorButton';
import styles from './Sidebar.module.css';


/* parametri per la sidebar: ogni pagina deve fornirli */
interface SidebarProps {
  activePage: 'editor' | 'history';
  onNavigate: (page: 'editor' | 'history') => void;
  onUpload: () => void; //azioni attivate dai pulsanti
  onSave: () => void;
  onPrint: () => void;
  onAiAction: () => void;
}


export const Sidebar = ({ activePage, onNavigate, onUpload, onSave, onPrint, onAiAction }: SidebarProps) => {
  const isHistoryMode = activePage === 'history'; //se la activePage è history si entra in isHistoryMode (true)

  return (
    <aside className={styles.sidebar}>

      {/* NAVIGAZIONE: Editor/Storico */}
      <nav className={styles.group}>
        <EditorButton
          icon={<TextInitial size={22} />}
          label="Editor"
          isActive={activePage === 'editor'}
          onClick={() => onNavigate('editor')} //azione che parte dopo che l'utente clicca
        />
        <EditorButton
          icon={<History size={22} />}
          label="Storico generazioni"
          isActive={activePage === 'history'}
          onClick={() => onNavigate('history')}
        />
      </nav>

      <div class="icon_separator" />

      {/* OPERAZIONI FILE (disattivate nello storico) */}
      <div className={styles.group}>
        <EditorButton
          icon={<FileUp size={22} />}
          label="Carica File"
          disabled={isHistoryMode}
          onClick={onUpload}
        />
        <EditorButton
          icon={<Save size={22} />}
          label="Salva File"
          disabled={isHistoryMode}
          onClick={onSave}
        />
        <EditorButton
          icon={<Printer size={22} />}
          label="Stampa"
          disabled={isHistoryMode}
          onClick={onPrint}
        />
      </div>

      <div class="icon_separator" />

      {/* icona AI */}
      <div className={styles.group}>
        <EditorButton
          icon={<Sparkles size={22} />}
          label="Operazioni AI"
          disabled={isHistoryMode}
          onClick={onAiAction}
        />
      </div>
    </aside>
  );
};