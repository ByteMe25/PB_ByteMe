
/* View pura per l'editor Markdown
 *  - Rende la <textarea> che EasyMDE usa come base (tramite la ref passata da useEditor)
 *  - Gestisce gli eventi di drag-and-drop e delegarli al ViewModel tramite la prop onFileDrop
 *  - Importa il CSS di EasyMDE (necessario per la libreria)
 *
 *  - Non crea istanze EasyMDE — lo fa useEditor (ViewModel)
 *  - Non gestisce la logica di toolbar — la gestisce useEditor
 *  - Non conosce lo storico, le chiamate AI, i file
 */

import React from 'react';
import 'easymde/dist/easymde.min.css';
import styles from './MarkdownEditor.module.css';

interface MarkdownEditorProps {
  //Ref creata da useEditor e passata qui:EasyMDE viene montato su questa textarea dal ViewModel
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;

  //Callback per il drag-and-drop: delega la logica al ViewModel useFileUpload
  onFileDrop?: (file: File) => void;
}

export const MarkdownEditor = ({ textareaRef, onFileDrop }: MarkdownEditorProps) => {
  //intercetta il drag per abilitare il drop (comportamento browser)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  //rilascio file: delega al ViewModel senza logica di validazione
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && onFileDrop) {
      onFileDrop(file);
    }
    e.dataTransfer.clearData();
  };

  return (
    <div
      className={styles.editorWrapper}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-testid="markdown-editor-wrapper"
    >
      {/*
       * la textarea è il punto di aggancio per EasyMDE
       * useEditor riceve textareaRef e monta EasyMDE su questo elemento DOM
       * data-testid permette ai test di trovare l'elemento senza dipendere dalla struttura HTML
       */}
      <textarea ref={textareaRef} data-testid="markdown-textarea" autoComplete="off" />
    </div>
  );
};