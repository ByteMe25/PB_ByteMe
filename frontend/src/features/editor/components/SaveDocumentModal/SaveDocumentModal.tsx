/* Modale per il salvataggio (download) del file */
import { useState, useEffect, useRef } from 'react';
import { X, Download, Loader } from 'lucide-react';
import styles from './SaveDocumentModal.module.css';

// import file per tipi e opzioni formati
import type { ExportFormat } from '../../types';
import { EXPORT_FORMAT_OPTIONS } from '../../types';
import { sanitizeFilename, composeFilename } from '../../utils/filenameUtils';

interface SaveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocumentName: string;
  onExport: (format: ExportFormat, filename: string) => void;
  isExporting?: boolean;
}


export const SaveDocumentModal = ({
  isOpen,
  onClose,
  currentDocumentName,
  onExport,
  isExporting = false
}: SaveDocumentModalProps) => {
  const [format, setFormat] = useState<ExportFormat>('md');
  const [baseFilename, setBaseFilename] = useState(''); //solo il nome, NO estensione
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  //inizializza il nome base solo quando la modale si apre
  useEffect(() => {
    if (isOpen) {
      const cleanName = currentDocumentName.replace(/\.[^/.]+$/, '') || 'documento';
      setBaseFilename(cleanName);
      
      //auto-focus per UX
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, currentDocumentName]);

  //gestione scorciatoie da tastiera (ESC e INVIO)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isExporting) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && baseFilename.trim()) handleExport();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExporting, baseFilename, format]);

  if (!isOpen) return null;

  //handler con sanitizzazione in tempo reale
  const handleNameChange = (value: string) => {
    //sanitizza ma NON trimma: l'utente può digitare spazi tra le parole
    setBaseFilename(sanitizeFilename(value));
  };

  const handleExport = () => {
    if (!baseFilename.trim()) return;
    //composizione finale con trim e estensione
    const finalFilename = composeFilename(baseFilename, format);
    onExport(format, finalFilename);
  };

  //logica inline per i tasti di scelta rapida
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isExporting) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
      
      if (e.key === 'Enter' && baseFilename.trim()) {
        const finalFilename = composeFilename(baseFilename, format);
        onExport(format, finalFilename);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isExporting, baseFilename, format, onClose, onExport]); 


  return (
    <div className={styles.backdrop} onClick={!isExporting ? onClose : undefined}>
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="modal-title">Esporta Documento</h2>
          <button
            className={styles.closeBtn}
            onClick={!isExporting ? onClose : undefined}
            disabled={isExporting}
            aria-label="Chiudi modale"
          >
            <X size={20} />
          </button>
        </header>

        <div className={styles.body}>
          <label className={styles.field}>
            <span className={styles.label}>Formato di esportazione</span>
            <select
              className={styles.select}
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              disabled={isExporting}
            >
              {/* rendering dinamico: aggiungi un formato e si aggiorna da solo */}
              {EXPORT_FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Nome file</span>
            <div className={styles.inputWrapper}>
              <input
                ref={inputRef}
                type="text"
                className={styles.input}
                value={baseFilename}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isExporting}
                placeholder="il-mio-documento"
              />
              {/* mostra l'estensione dinamicamente fuori dall'input */}
              <span className={styles.extension}>.{format}</span> 
            </div>
          </label>
        </div>

        <footer className={styles.footer}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onClose}
            disabled={isExporting}
          >
            Annulla
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleExport}
            disabled={isExporting || !baseFilename.trim()}
          >
            {isExporting ? (
              <>
                <Loader size={16} className={styles.spinner} />
                Esportazione...
              </>
            ) : (
              <>
                <Download size={16} />
                Esporta
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};