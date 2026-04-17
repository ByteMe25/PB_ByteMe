/* Hook per la gestione del caricamento file tramite drag & drop e file picker.
 * Valida formato/size (fileHandlers.ts), legge con FileReader, aggiorna EasyMDE e store.
*/

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useEditorMetaStore } from '../store/useEditorMetaStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.md', '.txt'];


export const useFileUpload = (onFileLoaded: (text: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    //validazioni sincrone (prima di attivare il loader)
    const isAllowed = ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isAllowed) {
      toast.error('Formato non supportato. Carica solo file .md o .txt');
      return; 
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Il file supera la dimensione massima di 5MB.');
      return; 
    }

    //inizio operazioni asincrone (attiva loader)
    setIsUploading(true);
    
    try {
      //controllo dati non salvati
      const { isDirty, setFileName, markSaved } = useEditorMetaStore.getState();
      if (isDirty) {
        const confirmed = window.confirm(
          'Hai delle modifiche non salvate. Sei sicuro di voler caricare un nuovo file e sovrascrivere quello attuale?'
        );
        if (!confirmed) return; 
      }

      //lettura del file
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileLoaded(content);
          setFileName(file.name);
          markSaved();
          toast.success(`File "${file.name}" caricato con successo!`);
          resolve();
        };

        reader.onerror = () => {
          toast.error('Impossibile leggere il file.');
          reject(new Error('Errore di lettura'));
        };

        reader.readAsText(file);
      });
      
    } catch (error) {
      //con catch la promise rifiutata non fa crashare l'app
      console.error('Errore durante il caricamento del file:', error);
    } finally {
      setIsUploading(false); //fine Loader
    }
  }, [onFileLoaded]);


/**
 * Helper per la UI: apre la finestra di dialogo nativa del sistema operativo
 * per la selezione dei file, senza dover inserire un <input> nel DOM React
*/
  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        processFile(file);
      }
      //rimuove l'input dalla memoria una volta usato
      input.remove(); 
    };
    
    input.click();
  }, [processFile]);


/**
 * Helper per la UI: da attaccare all'evento onDrop di un'area dell'editor
*/
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  return {
    processFile,
    openFilePicker,
    handleFileDrop,
    isUploading
  };
};