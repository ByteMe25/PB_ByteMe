import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EditorPage } from './EditorPage';

//MOCK DEI VIEWMODEL (HOOKS)
import { useEditor } from '../hooks/useEditor';
import { useSaveDocument } from '../hooks/useSaveDocument';
import { useFileUpload } from '../hooks/useFileUpload';
import { usePrintDocument } from '../hooks/usePrintDocument';
import { useEditorMetaStore } from '../store/useEditorMetaStore';
import { useHistoryStore } from '../../history/store/useHistoryStore';

vi.mock('../hooks/useEditor', () => ({ useEditor: vi.fn() }));
vi.mock('../hooks/useSaveDocument', () => ({ useSaveDocument: vi.fn() }));
vi.mock('../hooks/useFileUpload', () => ({ useFileUpload: vi.fn() }));
vi.mock('../hooks/usePrintDocument', () => ({ usePrintDocument: vi.fn() }));
vi.mock('../store/useEditorMetaStore', () => ({ useEditorMetaStore: vi.fn() }));
vi.mock('../../history/store/useHistoryStore', () => ({ useHistoryStore: vi.fn() }));

//MOCK DEI COMPONENTI (VIEW)- solo per testare l'orchestrazione della pagina
vi.mock('../../../components/Topbar/Topbar', () => ({
  Topbar: ({ onCloseDocument }: any) => (
    <div data-testid="mock-topbar">
      <button data-testid="topbar-close" onClick={onCloseDocument}>Chiudi</button>
    </div>
  )
}));

vi.mock('../../../components/Sidebar/Sidebar', () => ({
  Sidebar: ({ onUpload, onSave, onPrint, onAiPanelOpen }: any) => (
    <div data-testid="mock-sidebar">
      <button data-testid="sidebar-upload" onClick={onUpload}>Upload</button>
      <button data-testid="sidebar-save" onClick={onSave}>Save</button>
      <button data-testid="sidebar-print" onClick={onPrint}>Print</button>
      <button data-testid="sidebar-ai" onClick={onAiPanelOpen}>AI Panel</button>
    </div>
  )
}));

vi.mock('../components/MarkdownEditor/MarkdownEditor', () => ({
  MarkdownEditor: ({ onFileDrop }: any) => (
    <div 
      data-testid="mock-markdown-editor" 
      // Simuliamo il drop passando un file finto direttamente
      onDrop={() => onFileDrop(new File([''], 'test.md'))} 
    />
  )
}));

vi.mock('../components/SaveDocumentModal/SaveDocumentModal', () => ({
  SaveDocumentModal: ({ isOpen, onClose, onExport }: any) => (
    isOpen ? (
      <div data-testid="mock-save-modal">
        <button data-testid="modal-close" onClick={onClose}>Chiudi Modale</button>
        <button data-testid="modal-export" onClick={() => onExport('md', 'mio_file')}>Esporta</button>
      </div>
    ) : null
  )
}));


describe('EditorPage (Orchestratore)', () => {
  const mockClearEditor = vi.fn();
  const mockGetEditorText = vi.fn().mockReturnValue('# Contenuto di test');
  const mockOpenModal = vi.fn();
  const mockCloseModal = vi.fn();
  const mockHandleExport = vi.fn();
  const mockUploadFile = vi.fn();
  const mockOpenFilePicker = vi.fn();
  const mockHandlePrint = vi.fn();
  const mockSetFileName = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    //setup: cosa restituiscono i ViewModel
    vi.mocked(useEditor).mockReturnValue({
      textareaRef: { current: null } as any,
      isReady: true,
      getEditorText: mockGetEditorText,
      getSelection: vi.fn().mockReturnValue(''),
      insertTextAtCursor: vi.fn(),
      clearEditor: mockClearEditor,
      reloadFromStorage: vi.fn(),
      onEntryAdded: vi.fn(),
    });

    vi.mocked(useSaveDocument).mockReturnValue({
      isOpen: false, //inizialmente chiuso
      isExporting: false,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      handleExport: mockHandleExport,
    });

    vi.mocked(useFileUpload).mockReturnValue({
      isUploading: false,
      openFilePicker: mockOpenFilePicker,
      uploadFile: mockUploadFile,
      inputRef: { current: null } as any,
      handleFileInput: vi.fn(),
    });

    vi.mocked(usePrintDocument).mockReturnValue({
      handlePrint: mockHandlePrint
    });

    vi.mocked(useEditorMetaStore).mockReturnValue({
      fileName: 'Documento Test',
      setFileName: mockSetFileName,
      isDirty: false,
      markSaved: vi.fn(),
      markDirty: vi.fn()
    });

    vi.mocked(useHistoryStore).mockReturnValue(vi.fn());
    
    //evita che window.confirm blocchi i test
    window.confirm = vi.fn(() => true);
  });

  it('renderizza la struttura principale senza errori', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    expect(screen.getByTestId('mock-topbar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-markdown-editor')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-save-modal')).not.toBeInTheDocument(); //modale è chiuso
  });

  it('delega l\'apertura del modale di esportazione al click nella Sidebar', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('sidebar-save'));
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });

  it('delega la chiusura del documento alla Topbar', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('topbar-close'));
    expect(mockClearEditor).toHaveBeenCalledTimes(1);
    expect(mockSetFileName).toHaveBeenCalledWith('Documento senza titolo');
  });

  it('delega l\'apertura del selettore file alla Sidebar', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('sidebar-upload'));
    expect(mockOpenFilePicker).toHaveBeenCalledTimes(1);
  });

  it('delega la stampa alla Sidebar', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('sidebar-print'));
    expect(mockHandlePrint).toHaveBeenCalledTimes(1);
  });

  it('delega il Drop dei file al ViewModel useFileUpload', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    //simula il drop (onDrop è impostato nel nostro mock di MarkdownEditor)
    fireEvent.drop(screen.getByTestId('mock-markdown-editor'));
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
  });

  /* DA FARE DOPO AVER IMPLEMENTATO PANNELLO AI
  it('mostra e nasconde il pannello AI cliccando il bottone nella Sidebar', () => {
    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    
    //all'inizio non c'è
    expect(screen.queryByText('Pannello AI — in sviluppo')).not.toBeInTheDocument();
    
    //apre
    fireEvent.click(screen.getByTestId('sidebar-ai'));
    expect(screen.getByText('Pannello AI — in sviluppo')).toBeInTheDocument();

    //chiude usando la 'X' nel pannello
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Pannello AI — in sviluppo')).not.toBeInTheDocument();
  });
  */

  it('passa correttamente il contenuto dell\'editor quando si esporta dal modale', () => {
    //forza il mock di useSaveDocument per dire che il modale è APERTO
    vi.mocked(useSaveDocument).mockReturnValue({
      isOpen: true,
      isExporting: false,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      handleExport: mockHandleExport,
    });

    render(<MemoryRouter><EditorPage /></MemoryRouter>);
    
    //clicca "Esporta" dentro il modale
    fireEvent.click(screen.getByTestId('modal-export'));
    
    //verifica che handleExport sia stato chiamato passando il testo preso da getEditorText()
    expect(mockHandleExport).toHaveBeenCalledWith('mio_file', 'md', '# Contenuto di test');
  });
});