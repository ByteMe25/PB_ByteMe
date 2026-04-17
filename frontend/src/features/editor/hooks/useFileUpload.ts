/* Hook per la gestione del caricamento file tramite drag & drop e file picker.
 * Valida formato/size (fileHandlers.ts), legge con FileReader, aggiorna EasyMDE e store.
*/

import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useEditorMetaStore } from '../store/useEditorMetaStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.md', '.txt'];

export const useFileUpload = (onFileLoaded: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const CONTENT_KEY = 'secondbrain-editor-content';

  //funzione core che accetta direttamente un File
  const uploadFile = useCallback(async (file: File) => {
    //validazione Formato
    const isAllowed = ALLOWED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!isAllowed) {
      toast.error('Formato non supportato. Carica solo file .md o .txt');
      return;
    }
    //validazione dimensione
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Il file supera la dimensione massima di 5MB.');
      return;
    }
    //controllo dati non salvati
    const { isDirty, setFileName, markSaved } = useEditorMetaStore.getState();
    if (isDirty && !window.confirm('Hai modifiche non salvate. Sovrascrivere?')) {
      return;
    }

    setIsUploading(true);

    try {
      //lettura asincrona
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const text = e.target?.result as string;
          localStorage.setItem(CONTENT_KEY, text);
          setFileName(file.name.replace(/\.[^/.]+$/, ""));
          markSaved();
          onFileLoaded(); //dice a useEditor di ricaricare dal localStorage
          toast.success(`File "${file.name}" caricato!`);
          resolve();
        };

        reader.onerror = () => {
          toast.error('Errore durante la lettura del file.');
          reject(new Error('Lettura fallita'));
        };
        
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false); // Spegne lo spinner SOLO quando ha finito
    }
  }, [onFileLoaded]);

  const openFilePicker = useCallback(() => inputRef.current?.click(), []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
      e.target.value = ''; // Permette di ricaricare lo stesso file consecutivamente
    }
  }, [uploadFile]);

  return { 
    isUploading, 
    openFilePicker, 
    uploadFile, //esposto per MarkdownEditor
    inputRef, 
    handleFileInput 
  };
};