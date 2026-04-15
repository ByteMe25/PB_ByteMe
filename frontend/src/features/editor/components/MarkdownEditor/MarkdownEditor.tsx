import React, { useEffect, useRef } from 'react';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css'; // CSS base della libreria easyMDE
import styles from './MarkdownEditor.module.css';
import toast from 'react-hot-toast';


interface MarkdownEditorProps {
  //riceve la ref dal genitore così useEditor può interagire con il testo
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  //Dependency Injection per il Drag & Drop (MVVM pattern puro)
  onFileDrop?: (file: File) => void;
}

export const MarkdownEditor = ({ textareaRef, onFileDrop }: MarkdownEditorProps) => {
  //istanza di EasyMDE per poterla distruggere quando il componente si smonta
  const easyMdeInstance = useRef<EasyMDE | null>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    //inizializzazione
    easyMdeInstance.current = new EasyMDE({
      element: textareaRef.current,
      spellChecker: false,
      sideBySideFullscreen: false,
      autofocus: true,
      inputStyle: "contenteditable",
      status: ["autosave", "lines", "words", "cursor"],
      syncSideBySidePreviewScroll: false,
      
      //toolbar personalizzata
      toolbar: [
        "undo", "redo", "|",
        "bold", "italic",
        {
          name: "underline",
          action: (editor) => {
            const cm = editor.codemirror;
            const selectedText = cm.getSelection();
            const text = selectedText || "testo";
            cm.replaceSelection(`<u>${text}</u>`);
          },
          className: "fa fa-underline",
          title: "Sottolineato",
        },
        "|",
        "heading-smaller", "heading-bigger", "|",
        "table",
        {
          name: "horizontal-rule",
          action: (editor) => {
            const cm = editor.codemirror;
            const cursor = cm.getCursor();
            cm.replaceRange("\n\n---\n\n", cursor);
            cm.focus();
          },
          className: "fa fa-minus",
          title: "Linea orizzontale",
        },
        "link", "|",
        "unordered-list", "ordered-list",
        "|",
        {
          name: "copy",
          action: (editor) => {
            const txt = editor.codemirror.getSelection();
            if (!txt) {
              toast.error("Seleziona del testo prima!"); //notifica errore
              return;
            }
            navigator.clipboard.writeText(txt).then(() => {
              toast.success("Copiato negli appunti!"); //notifica successo
            });
          },
          className: "fa fa-copy",
          title: "Copia (Ctrl+C)",
        },
        {
          name: "paste",
          action: (editor) => {
            navigator.clipboard.readText()
              .then(t => {
                editor.codemirror.replaceSelection(t);
                toast.success("Testo incollato!");
              })
              .catch(() => toast.error("Usa CTRL+V per incollare"));
          },
          className: "fa fa-paste",
          title: "Incolla (Ctrl+V)",
        },
        {
          name: "cut",
          action: (editor) => {
            const cm = editor.codemirror;
            const txt = cm.getSelection();
            if (!txt) {
              toast.error("Seleziona del testo prima!");
              return;
            }
            navigator.clipboard.writeText(txt).then(() => {
              cm.replaceSelection("");
              toast.success("Testo tagliato!");
            });
          },
          className: "fa fa-scissors",
          title: "Taglia (Ctrl+X)",
        },
        "|",

        //modalità di visualizzazione
        {
          name: "editor-only",
          action: (editor) => {
            if (editor.isPreviewActive()) EasyMDE.togglePreview(editor);
            if (editor.isSideBySideActive()) EasyMDE.toggleSideBySide(editor);
          },
          className: "fa fa-pen",
          title: "Solo Editor",
        },
        {
          name: "preview-only",
          action: (editor) => {
            if (editor.isSideBySideActive()) EasyMDE.toggleSideBySide(editor);
            if (!editor.isPreviewActive()) EasyMDE.togglePreview(editor);
          },
          className: "fa fa-eye",
          title: "Solo Anteprima",
        },
        {
          name: "side-by-side",
          action: (editor) => {
            if (editor.isPreviewActive()) EasyMDE.togglePreview(editor);
            if (!editor.isSideBySideActive()) EasyMDE.toggleSideBySide(editor);
          },
          className: "fa fa-columns",
          title: "Modalità Affiancata",
        },
      ],
      // non dovrebbe servire PreviewRender (come poc), si usa comportamento nativo di EasyMDE
    });

    //imposta la vista di default (Side by Side)
    setTimeout(() => {
      if (easyMdeInstance.current && !easyMdeInstance.current.isSideBySideActive()) {
        EasyMDE.toggleSideBySide(easyMdeInstance.current);
      }
    }, 100);

    // CLEANUP: quando si esce dalla pagina, distrugge l'editor per non intaccare la memoria
    return () => {
      if (easyMdeInstance.current) {
        easyMdeInstance.current.toTextArea();
        easyMdeInstance.current = null;
      }
    };
  }, [textareaRef]);

  // SENSORI PER IL DRAG & DROP
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); //serve per drop
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      //delega la logica al ViewModel/genitore
      if (onFileDrop) onFileDrop(droppedFile);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div 
      className={styles.editorWrapper}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* data-testid per testare il componente in modo indipendente da EasyMDE */}
      <textarea ref={textareaRef} data-testid="markdown-textarea" />
    </div>
  );
};