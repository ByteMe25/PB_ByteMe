import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveDocumentModal } from './SaveDocumentModal';

describe('SaveDocumentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnExport = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    currentDocumentName: 'documento-iniziale.md',
    onExport: mockOnExport,
    isExporting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('non renderizza nulla se isOpen è false', () => {
    render(<SaveDocumentModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });


  it('renderizza correttamente quando aperta e pulisce il nome iniziale', () => {
    render(<SaveDocumentModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    //controlla che abbia tolto l'estensione originaria (.md) dal nome base
    const input = screen.getByLabelText(/nome file/i) as HTMLInputElement;
    expect(input.value).toBe('documento-iniziale');
  });


  it('chiama onClose quando si clicca su Annulla o sulla X', () => {
    render(<SaveDocumentModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/annulla/i));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText(/chiudi modale/i));
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });


  it('sanitizza il nome file in tempo reale senza applicare trim', () => {
    render(<SaveDocumentModal {...defaultProps} />);
    const input = screen.getByLabelText(/nome file/i);
    
    fireEvent.change(input, { target: { value: 'mio <file> nuovo ' } });
    expect((input as HTMLInputElement).value).toBe('mio _file_ nuovo ');
  });


  it('compone il filename finale e chiama onExport', () => {
    render(<SaveDocumentModal {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/nome file/i), { target: { value: '  report finale  ' } });
    fireEvent.change(screen.getByLabelText(/formato/i), { target: { value: 'html' } });
    fireEvent.click(screen.getByRole('button', { name: /esporta/i }));
    
    //il trim() viene applicato qui, al momento dell'export
    expect(mockOnExport).toHaveBeenCalledWith('html', 'report finale.html');
  });

  it('disabilita i controlli durante l\'esportazione (isExporting = true)', () => {
    render(<SaveDocumentModal {...defaultProps} isExporting={true} />);
    
    expect(screen.getByLabelText(/nome file/i)).toBeDisabled();
    expect(screen.getByLabelText(/formato/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /esportazione.../i })).toBeDisabled();
    expect(screen.getByText(/annulla/i)).toBeDisabled();
  });
});