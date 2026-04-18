/* Pagina principale dell'editor — orchestratore MVVM
 *  - Monta tutti i ViewModel (hook) e inietta le dipendenze tra loro
 *  - Passa le callback giuste a Sidebar, Topbar, MarkdownEditor, modali
 *  - Gestisce la navigazione verso /storico tramite React Router
 *  - Coordina il flusso AI → Storico tramite Dependency Injection
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//viewModel (hooks)
import { useEditor } from '../hooks/useEditor';
import { useSaveDocument } from '../hooks/useSaveDocument';
import { useFileUpload } from '../hooks/useFileUpload';
import { usePrintDocument } from '../hooks/usePrintDocument';
//model (store)
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import { useHistoryStore } from '../../history/store/useHistoryStore';
//componenti
import { Topbar } from '../../../components/Topbar/Topbar';
import { Sidebar } from '../../../components/Sidebar/Sidebar';
import { MarkdownEditor } from '../components/MarkdownEditor/MarkdownEditor';
import { SaveDocumentModal } from '../components/SaveDocumentModal/SaveDocumentModal';

import styles from './EditorPage.module.css';
import type { ExportFormat } from '../types';


export const EditorPage = () => {
  const navigate = useNavigate();
  //STATO UI LOCALE: pannello AI aperto/chiuso
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  //MODEL: legge i metadati dell'editor dallo Zustand store (Observer pattern)
  const { fileName, setFileName, isDirty } = useEditorMetaStore();
  //MODEL: funzione per aggiungere voci allo storico, iniettata in useEditor tramite DI
  const addHistoryEntry = useHistoryStore((state) => state.addEntry);

  const editor = useEditor({
    //cast esplicito per compatibilità tra HistoryEntry e unknown
    onEntryAdded: addHistoryEntry as (entry: unknown) => void
  });

  //VIEWMODEL: salvataggio documento
  const { isOpen: isSaveModalOpen, openModal: openSaveModal, closeModal: closeSaveModal, handleExport, isExporting } = useSaveDocument();

  // VIEWMODEL: caricamento file
  const { openFilePicker, uploadFile } = useFileUpload(editor.reloadFromStorage);
  //VIEWMODEL: stampa
  const { handlePrint } = usePrintDocument(editor.getEditorText);

  //HANDLERS: trasformano le azioni dell'utente in chiamate ai ViewModel
  //Handler export: raccoglie il testo corrente e delega al ViewModel
  const handleExportWithContent = useCallback((format: ExportFormat, name: string) => {
    handleExport(name, format, editor.getEditorText());
  }, [handleExport, editor]);

  //Chiude il documento, svuota editor e resetta i metadati
  const handleCloseDocument = useCallback(() => {
    if (isDirty && !window.confirm('Hai modifiche non salvate. Chiudere?')) return;
    editor.clearEditor();
    setFileName('Documento senza titolo');
  }, [isDirty, editor, setFileName]);


  return (
    <div className={styles.layout}>
      {/* TOPBAR: nome documento + pulsante chiudi */}
      <Topbar
        documentName={fileName}
        onDocumentNameChange={setFileName}
        onCloseDocument={handleCloseDocument}
      />

      <div className={styles.body}>
        {/* SIDEBAR: navigazione + azioni file + AI */}
        <Sidebar
          activePage="editor"
          onNavigate={(p) => p === 'history' && navigate('/storico')}
          onUpload={openFilePicker}
          onSave={openSaveModal}
          onPrint={handlePrint}
          onAiAction={() => setIsAiPanelOpen((prev) => !prev)}
        />

        {/* AREA PRINCIPALE: editor + pannello AI (quando aperto) */}
        <main className={styles.main}>
          {/* 
           * MarkdownEditor è View pura:
           *  - textareaRef: useEditor monta EasyMDE su questo elemento
           *  - onFileDrop: delega al ViewModel useFileUpload
           */}
          <MarkdownEditor 
            textareaRef={editor.textareaRef} 
            onFileDrop={uploadFile}
          />

          {/*
           * AiPanel deve ancora essere fatto, ma placeholder per lo stato aperto/chiuso già gestito
           * Quando implementato, riceverà:
           *  - getSelection per ottenere il testo selezionato
           *  - insertTextAtCursor per inserire il risultato AI
           *  - onClose per chiudere il pannello
           *  - onEntryAdded (addEntry) per aggiornare lo Storico
           */}
          {isAiPanelOpen && (
            <aside className={styles.aiPanel}>
              {/* AiPanel andrà qui — placeholder visibile per ora */}
              <div className={styles.aiPanelPlaceholder}>
                <p>Pannello AI — in sviluppo</p>
                <button onClick={() => setIsAiPanelOpen(false)}>✕</button>
              </div>
            </aside>
          )}
        </main>
      </div>

      {/* MODALE SALVATAGGIO: portale sopra l'editor */}
      <SaveDocumentModal
        isOpen={isSaveModalOpen}
        onClose={closeSaveModal}
        currentDocumentName={fileName}
        onExport={handleExportWithContent}
        isExporting={isExporting}
      />
    </div>
  );
};