/* Coordina la modale di salvataggio: traccia se la modale è aperta o chiusa, 
 * controlla che il nome del file inserito dall'utente sia valido (non vuoto, senza caratteri proibiti) e
 * quando l'utente clicca "Conferma" orchestra il download fisico del file e avvisa l'editor di salvare nello storico
*/

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { ExportFormat } from '../types';
import { downloadFile } from '../utils/fileHandler';
import { composeFilename } from '../utils/filenameUtils';
import { useEditorMetaStore } from '../store/useEditorMetaStore';

export const useSaveDocument = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  ///Orchestra il processo di esportazione: sanitizza il nome, scarica il file e aggiorna lo store
  const handleExport = useCallback(
    async (rawFilename: string, format: ExportFormat, content: string) => {
      setIsExporting(true);
      try {
        const safeFilename = composeFilename(rawFilename, format);

        //mappatura type-safe dei MIME type
        const mimeTypeMap: Record<ExportFormat, string> = {
          md: 'text/markdown',
          txt: 'text/plain',
          html: 'text/html'
        };

        //esegue il download fisico
        downloadFile(content, safeFilename, mimeTypeMap[format]);

        //aggiorna il Model (Zustand) solo se il download va a buon fine
        useEditorMetaStore.getState().markSaved();

        toast.success(`Documento "${safeFilename}" esportato con successo!`);
        closeModal();
      } catch (error) {
        console.error('Errore durante l\'esportazione:', error);
        toast.error('Errore durante l\'esportazione del documento.');
      } finally {
        setIsExporting(false);
      }
    },
    [closeModal]
  );

  return {
    isOpen,
    isExporting,
    openModal,
    closeModal,
    handleExport,
  };
};