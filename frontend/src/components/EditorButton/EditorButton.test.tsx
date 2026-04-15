import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorButton } from './EditorButton';
import { FileText } from 'lucide-react';

describe('Componente EditorButton', () => {
  const mockOnClick = vi.fn();

  // reset della memoria: pulisce il conteggio dei click tra un test e l'altro
  beforeEach(() => {
    vi.clearAllMocks();
  });


  it('renderizza correttamente l\'icona e ha l\'etichetta accessibile (label)', () => {
    render(
      <EditorButton
        icon={<FileText size={22} data-testid="test-icon" />}
        label="Bottone Test"
        onClick={mockOnClick}
      />
    );

    // verifica che l'etichetta sia presente
    expect(screen.getByLabelText('Bottone Test')).toBeInTheDocument();

    // verifica che l'icona sia stata disegnata
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });


  it('esegue la funzione onClick esattamente una volta quando viene cliccato', () => {
    render(
      <EditorButton
        icon={<FileText size={22} />}
        label="Cliccami"
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // toHaveBeenCalledTimes(1) invece di toHaveBeenCalled() per non far partire click doppi per errore
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });


  it('applica lo stato attivo (Active) correttamente', () => {
    render(
      <EditorButton
        icon={<FileText size={22} />}
        label="Attivo"
        isActive={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    
    // verifica l'attributo di accessibilità
    expect(button).toHaveAttribute('aria-pressed', 'true');
    
    // verifica della classe CSS (Regex)
    expect(button.className).toMatch(/active/);
  });


  it('si disabilita e NON permette il click quando disabled è true', () => {
    render(
      <EditorButton
        icon={<FileText size={22} />}
        label="Disabilitato"
        disabled={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');

    // verifica che sia tecnicamente disabilitato
    expect(button).toBeDisabled();

    fireEvent.click(button); //azione: click
    expect(mockOnClick).not.toHaveBeenCalled(); //reazione: la funzione di click NON è stata chiamata (perché è disabilitato)
  });
});