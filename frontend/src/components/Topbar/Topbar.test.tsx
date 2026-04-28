/* Test per il componente Topbar - automatico al push */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Topbar } from './Topbar';

describe('Componente Topbar', () => {
  // finte funzioni (mock) per catturare gli eventi
  const mockOnDocumentNameChange = vi.fn();
  const mockOnCloseDocument = vi.fn();

  it('renderizza correttamente il logo e il nome del documento', () => {
    render(
      <Topbar 
        documentName="Appunti.md" //nome del documento passato come prop
        onDocumentNameChange={mockOnDocumentNameChange} 
        onCloseDocument={mockOnCloseDocument} 
      />
    );

    //verifica che il nome dell'app sia visibile (Second Brain)
    expect(screen.getByText('Second Brain')).toBeInTheDocument();
    
    //verifica che l'input contenga il nome passato nelle props
    const input = screen.getByLabelText('Titolo documento');
    expect(input).toHaveValue('Appunti.md');
  });


  it('mostra il placeholder quando il nome del documento è vuoto', () => {
    render(
      <Topbar 
        documentName="" 
        onDocumentNameChange={mockOnDocumentNameChange} 
        onCloseDocument={mockOnCloseDocument} 
      />
    );

    const input = screen.getByPlaceholderText('Documento senza titolo');
    expect(input).toBeInTheDocument();
  });


  it('chiama onDocumentNameChange quando l\'utente digita un nuovo titolo', () => {
    render(
      <Topbar 
        documentName="Appun" 
        onDocumentNameChange={mockOnDocumentNameChange} 
        onCloseDocument={mockOnCloseDocument} 
      />
    );

    const input = screen.getByLabelText('Titolo documento');
    
    //simula l'utente che digita "ti" per formare "Appunti"
    fireEvent.change(input, { target: { value: 'Appunti' } });

    //verifica che la funzione sia stata chiamata con il nuovo valore
    expect(mockOnDocumentNameChange).toHaveBeenCalledWith('Appunti');
  });


  it('chiama onCloseDocument quando l\'utente clicca la X', () => {
    render(
      <Topbar 
        documentName="Test" 
        onDocumentNameChange={mockOnDocumentNameChange} 
        onCloseDocument={mockOnCloseDocument} 
      />
    );

    const closeButton = screen.getByLabelText('Chiudi documento');
    
    //simula il click
    fireEvent.click(closeButton);

    //verifica che la funzione di chiusura sia scattata esattamente una volta
    expect(mockOnCloseDocument).toHaveBeenCalledTimes(1);
  });
});