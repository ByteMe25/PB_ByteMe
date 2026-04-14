import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MarkdownEditor } from './MarkdownEditor';
import EasyMDE from 'easymde';

// 1. MOCK DELLA LIBRERIA EASYMDE
vi.mock('easymde', () => {
  const mockInstance = {
    toTextArea: vi.fn(),
    isSideBySideActive: vi.fn().mockReturnValue(false),
    isPreviewActive: vi.fn().mockReturnValue(false),
  };
  
  // CORREZIONE: Usiamo una funzione classica (function) invece della freccia
  // in modo che possa essere usata con "new EasyMDE()"
  const EasyMDEMock = vi.fn(function() {
    return mockInstance;
  });
  
  // Metodi statici di EasyMDE usati nella toolbar
  (EasyMDEMock as any).toggleSideBySide = vi.fn();
  (EasyMDEMock as any).togglePreview = vi.fn();

  return { default: EasyMDEMock };
});

describe('Componente MarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderizza correttamente la textarea di base', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    // Cerca la textarea (React la monta, poi EasyMDE la trasformerà)
    const textarea = screen.getByRole('textbox', { hidden: true });
    expect(textarea).toBeInTheDocument();
  });

  it('inizializza EasyMDE quando viene montato', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    // Verifica che il costruttore della libreria sia stato chiamato
    expect(EasyMDE).toHaveBeenCalledTimes(1);
  });

  it('smonta e pulisce l\'istanza (toTextArea) quando il componente viene distrutto', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const { unmount } = render(<MarkdownEditor textareaRef={ref} />);
    
    // Recuperiamo l'istanza mockata per vedere se i suoi metodi vengono chiamati
    const mockInstance = (vi.mocked(EasyMDE).mock.results[0].value as any);
    
    // Smontiamo il componente (simula il cambio pagina)
    unmount();
    
    // Verifica che la funzione di cleanup di EasyMDE sia scattata
    expect(mockInstance.toTextArea).toHaveBeenCalledTimes(1);
  });
});