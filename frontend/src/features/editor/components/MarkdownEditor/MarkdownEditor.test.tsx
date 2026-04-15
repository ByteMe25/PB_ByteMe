import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import EasyMDE from 'easymde';


//mock della libreria EasyMDE
vi.mock('easymde', () => {
  const mockInstance = {
    toTextArea: vi.fn(),
    isSideBySideActive: vi.fn().mockReturnValue(false),
    isPreviewActive: vi.fn().mockReturnValue(false),
  };
  
  const EasyMDEMock = vi.fn(function () {
    return mockInstance;
  });

  //metodi statici di EasyMDE usati nella toolbar
  (EasyMDEMock as any).toggleSideBySide = vi.fn();
  (EasyMDEMock as any).togglePreview = vi.fn();

  return { default: EasyMDEMock };
});


//mock di react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));


describe('Componente MarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); //timer falsi per il setTimeout
  });

  afterEach(() => {
    vi.useRealTimers();
  });


  it('renderizza il contenitore principale e la textarea', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    //usa l'attributo data-testid (cerca la textarea)
    const textarea = screen.getByTestId('markdown-textarea');
    expect(textarea).toBeInTheDocument();
  });

  it('inizializza EasyMDE al mount con la textarea ricevuta', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    //verifica chiamata al costruttore di EasyMDE con la textarea corretta
    expect(EasyMDE).toHaveBeenCalledTimes(1);
    expect(EasyMDE).toHaveBeenCalledWith(
      expect.objectContaining({ element: ref.current })
    );
  });


  it('attiva la modalità side-by-side dopo il setTimeout iniziale', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    //avanza il timer di 100ms
    vi.advanceTimersByTime(100);
    expect((EasyMDE as any).toggleSideBySide).toHaveBeenCalledTimes(1);
  });


  it('non ri-attiva side-by-side se è già attivo', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    //l'istanza esiste dopo il render, quindi possiamo sovrascrivere il return value qui
    const mockInstance = vi.mocked(EasyMDE).mock.results[0].value as any;
    mockInstance.isSideBySideActive.mockReturnValue(true);
    
    vi.advanceTimersByTime(100);
    expect((EasyMDE as any).toggleSideBySide).not.toHaveBeenCalled();
  });


  it('esegue il cleanup (toTextArea) quando il componente viene smontato', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const { unmount } = render(<MarkdownEditor textareaRef={ref} />);
    
    //recupera l'istanza mockata per verificare se i suoi metodi vengono chiamati
    const mockInstance = vi.mocked(EasyMDE).mock.results[0].value as any;
    unmount();
    
    expect(mockInstance.toTextArea).toHaveBeenCalledTimes(1);
  });


  it('intercetta il drop di un file e chiama la prop onFileDrop', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const mockOnFileDrop = vi.fn();
    const { container } = render(<MarkdownEditor textareaRef={ref} onFileDrop={mockOnFileDrop} />);
    
    //trova il wrapper div (primo figlio del container)
    const editorWrapper = container.firstChild as HTMLElement;
    
    //crea un finto file
    const file = new File(['contenuto'], 'test.md', { type: 'text/markdown' });
    
    //simula il drop (evento)
    fireEvent.drop(editorWrapper, {
      dataTransfer: {
        files: [file],
        clearData: vi.fn(),
      },
    });

    expect(mockOnFileDrop).toHaveBeenCalledTimes(1);
    expect(mockOnFileDrop).toHaveBeenCalledWith(file);
  });

  it('previene il comportamento di default del browser sul dragOver e sul drop', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const mockOnFileDrop = vi.fn();
    const { container } = render(<MarkdownEditor textareaRef={ref} onFileDrop={mockOnFileDrop} />);
    
    const wrapper = container.firstChild as HTMLElement;
    
    //crea mock event separati per tracciare il preventDefault
    const mockDragOverEvent = new Event('dragover', { bubbles: true });
    Object.assign(mockDragOverEvent, { preventDefault: vi.fn() });
    
    const mockDropEvent = new Event('drop', { bubbles: true });
    Object.assign(mockDropEvent, { 
      preventDefault: vi.fn(),
      dataTransfer: { files: [new File(['test'], 'test.md')], clearData: vi.fn() }
    });
    
    //spara prima il passaggio del mouse, poi il rilascio del file
    fireEvent(wrapper, mockDragOverEvent);
    fireEvent(wrapper, mockDropEvent);
    
    //verifica che entrambi i "sensori" abbiano bloccato il browser
    expect(mockDragOverEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(mockDropEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

});