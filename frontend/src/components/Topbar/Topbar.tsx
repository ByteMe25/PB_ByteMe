import React from 'react';
import { Brain, X } from 'lucide-react';
import styles from './Topbar.module.css';


/*Props (interface) della Topbar - si possono riusare */
interface TopbarProps {
  documentName: string;
  /* Callback chiamata ogni volta che il titolo viene modificato */
  onDocumentNameChange: (newName: string) => void;
  /* Callback chiamata per chiudere/resettare il file */
  onCloseDocument: () => void;
}


export const Topbar = ({documentName, onDocumentNameChange, onCloseDocument}: TopbarProps) => {
  return (
    <header className={styles.topbar}>
      
      {/* logo e nome app */}
        <div className={styles.brand}>
            <Brain size={24} color="var(--col-accent)" />
            <span className={styles.brandName}>Second Brain</span>
        </div>

      {/* nome documento e X per chiuderlo */}
        <div className={styles.documentArea}>
            <input
                type="text"
                className={styles.titleInput}
                value={documentName}
                onChange={(e) => onDocumentNameChange(e.target.value)}
                placeholder="Documento senza titolo"
                aria-label="Titolo documento"
            />

            <button 
                className={styles.closeButton}
                onClick={onCloseDocument}
                aria-label="Chiudi documento"
                title="Svuota editor"
            >
            <X size={18} strokeWidth={2.5} />
            </button>
        </div>

    </header>
  );
};