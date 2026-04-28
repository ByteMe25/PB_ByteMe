/* Test per il componente Sidebar */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar } from './Sidebar';


describe('Componente Sidebar', () => {
  // mock functions per spiare i click
  const mockOnNavigate = vi.fn();
  const mockOnUpload = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnPrint = vi.fn();
  const mockOnAiAction = vi.fn();

  // prima di ogni test, resetta i contatori dei mock
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // RENDERIZZAZIONE BASE
  it('renderizza tutti i bottoni correttamente', () => {
    render(
      <Sidebar 
        activePage="editor" 
        onNavigate={mockOnNavigate}
        onUpload={mockOnUpload}
        onSave={mockOnSave}
        onPrint={mockOnPrint}
        onAiAction={mockOnAiAction}
      />
    );

    // verifica che esistono tutti cercando la loro label
    expect(screen.getByLabelText('Editor')).toBeInTheDocument();
    expect(screen.getByLabelText('Storico generazioni')).toBeInTheDocument();
    expect(screen.getByLabelText('Carica File')).toBeInTheDocument();
    expect(screen.getByLabelText('Salva File')).toBeInTheDocument();
    expect(screen.getByLabelText('Stampa')).toBeInTheDocument();
    expect(screen.getByLabelText('Operazioni AI')).toBeInTheDocument();
  });


  // MODALITÀ EDITOR (tutti pulsanti attivi)
  it('chiama le funzioni corrette quando i bottoni vengono cliccati in modalità editor', () => {
    render(
      <Sidebar 
        activePage="editor" 
        onNavigate={mockOnNavigate}
        onUpload={mockOnUpload}
        onSave={mockOnSave}
        onPrint={mockOnPrint}
        onAiAction={mockOnAiAction}
      />
    );

    // testa la navigazione
    fireEvent.click(screen.getByLabelText('Storico generazioni')); //azione: clicca sul bottone "Storico generazioni"
    expect(mockOnNavigate).toHaveBeenCalledWith('history'); //reazione: la funzione di navigazione è stata chiamata con "history"

    // testa le azioni e verifica che i mock sono stati premuti
    fireEvent.click(screen.getByLabelText('Carica File'));
    expect(mockOnUpload).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Salva File'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Stampa'));
    expect(mockOnPrint).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Operazioni AI'));
    expect(mockOnAiAction).toHaveBeenCalledTimes(1);
  });


  // MODALITÀ STORICO (azioni disabilitate)
  it('disabilita i bottoni delle azioni file e AI quando si è nella pagina Storico generazioni', () => {
    render(
      <Sidebar 
        activePage="history"
        onNavigate={mockOnNavigate}
        onUpload={mockOnUpload}
        onSave={mockOnSave}
        onPrint={mockOnPrint}
        onAiAction={mockOnAiAction}
      />
    );

    const btnUpload = screen.getByLabelText('Carica File'); //prende il bottone
    const btnSave = screen.getByLabelText('Salva File');
    const btnPrint = screen.getByLabelText('Stampa');
    const btnAi = screen.getByLabelText('Operazioni AI');

    // verifica che HTML sappia che sono disabilitati
    expect(btnUpload).toBeDisabled(); // è disabilitato? true
    expect(btnSave).toBeDisabled();
    expect(btnPrint).toBeDisabled();
    expect(btnAi).toBeDisabled();

    // prova forzatamente a cliccarli lo stesso
    fireEvent.click(btnUpload);
    fireEvent.click(btnSave);
    fireEvent.click(btnPrint);
    fireEvent.click(btnAi);

    // verifica che i mock NON siano partiti (devono essere a zero)
    expect(mockOnUpload).not.toHaveBeenCalled();
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(mockOnPrint).not.toHaveBeenCalled();
    expect(mockOnAiAction).not.toHaveBeenCalled();
  });
});