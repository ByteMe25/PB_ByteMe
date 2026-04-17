import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MarkdownEditor } from './MarkdownEditor';

describe('Componente MarkdownEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderizza correttamente la textarea di base', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    //verifichiamo che la textarea esista tramite il test-id
    const textarea = screen.getByTestId('markdown-textarea');
    expect(textarea).toBeInTheDocument();
  });


  it('delega correttamente il file drop alla callback onFileDrop', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    const mockOnFileDrop = vi.fn();
    
    render(<MarkdownEditor textareaRef={ref} onFileDrop={mockOnFileDrop} />);
    
    const editorWrapper = screen.getByTestId('markdown-editor-wrapper');
    const file = new File(['contenuto'], 'test.md', { type: 'text/markdown' });

    //simula il drop
    fireEvent.drop(editorWrapper, {
      dataTransfer: {
        files: [file],
        clearData: vi.fn(),
      },
    });

    expect(mockOnFileDrop).toHaveBeenCalledTimes(1);
    expect(mockOnFileDrop).toHaveBeenCalledWith(file);
  });


  it('previene il comportamento di default del browser durante il drag', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<MarkdownEditor textareaRef={ref} />);
    
    const editorWrapper = screen.getByTestId('markdown-editor-wrapper');
    
    //crea un evento custom per spiare il preventDefault
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
    const spy = vi.spyOn(dragOverEvent, 'preventDefault');
    
    fireEvent(editorWrapper, dragOverEvent);
    
    expect(spy).toHaveBeenCalled();
  });
});