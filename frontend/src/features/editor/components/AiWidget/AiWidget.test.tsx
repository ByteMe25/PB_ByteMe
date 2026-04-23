import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiWidget } from './AiWidget';
import { useAiWidgetStore } from './aiWidgetStore';
import { IdleState } from './states/IdleState';
import { LoadingState } from './states/LoadingState';
import { DoneState } from './states/DoneState';
import { ErrorState } from './states/ErrorState';
import { InputState } from './states/InputState';

// mock di useDraggable per simulare spostamento da parte dell'utente
vi.mock('../../hooks/useDraggable', () => ({
  useDraggable: () => ({
    pos: { x: 100, y: 100 },
    onMouseDown: vi.fn(),
  }),
}));


const setWidgetState = (state: ReturnType<typeof useAiWidgetStore.getState>['widgetState']) => {
  useAiWidgetStore.getState().changeState(state);
};

describe('AiWidget Component', () => {
  beforeEach(() => {
    useAiWidgetStore.getState().reset();
  });

  // ─── Visibilità ────────────────────────────────────────────────────────────

  describe('Visibilità', () => {
    it('non renderizza nulla quando lo stato è IdleState', () => {
      setWidgetState(new IdleState());
      const { container } = render(<AiWidget />);
      expect(container.firstChild).toBeNull();
    });

    it('renderizza il widget quando lo stato NON è IdleState', () => {
      setWidgetState(new LoadingState());
      render(<AiWidget />);
      expect(screen.getByText('Generazione AI')).toBeInTheDocument();
    });
  });

  // ─── LoadingState ──────────────────────────────────────────────────────────

  describe('LoadingState', () => {
    it('mostra il testo di caricamento', () => {
      setWidgetState(new LoadingState());
      render(<AiWidget />);
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('mostra il pulsante Annulla se LoadingState ha onCancel', () => {
      const mockOnCancel = vi.fn();
      setWidgetState(new LoadingState(mockOnCancel));
      render(<AiWidget />);
      expect(screen.getByRole('button', { name: 'Annulla' })).toBeInTheDocument();
    });

    it('chiama onCancel quando si clicca Annulla', () => {
      const mockOnCancel = vi.fn();
      setWidgetState(new LoadingState(mockOnCancel));
      render(<AiWidget />);
      fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('non mostra azioni se LoadingState non ha onCancel', () => {
      setWidgetState(new LoadingState()); // senza callback
      render(<AiWidget />);
      expect(screen.queryByRole('button', { name: 'Annulla' })).not.toBeInTheDocument();
    });
  });

  // ─── DoneState ─────────────────────────────────────────────────────────────

  describe('DoneState', () => {
    const mockOnInsert = vi.fn();
    const mockOnDiscard = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('mostra il testo del risultato generato', () => {
      setWidgetState(new DoneState('Testo generato dall\'AI', mockOnInsert, mockOnDiscard));
      render(<AiWidget />);
      expect(screen.getByText("Testo generato dall'AI")).toBeInTheDocument();
    });

    it('mostra i pulsanti Inserisci e Scarta', () => {
      setWidgetState(new DoneState('Risultato', mockOnInsert, mockOnDiscard));
      render(<AiWidget />);
      expect(screen.getByRole('button', { name: 'Inserisci' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Scarta' })).toBeInTheDocument();
    });

    it('chiama onInsert con il testo corretto quando si clicca Inserisci', () => {
      setWidgetState(new DoneState('Testo da inserire', mockOnInsert, mockOnDiscard));
      render(<AiWidget />);
      fireEvent.click(screen.getByRole('button', { name: 'Inserisci' }));
      expect(mockOnInsert).toHaveBeenCalledWith('Testo da inserire');
    });

    it('chiama onDiscard quando si clicca Scarta', () => {
      setWidgetState(new DoneState('ok', mockOnInsert, mockOnDiscard));
      render(<AiWidget />);
      fireEvent.click(screen.getByRole('button', { name: 'Scarta' }));
      expect(mockOnDiscard).toHaveBeenCalled();
    });

    it('mostra il pulsante Rigenera solo se onRegenerate è definito', () => {
      const mockOnRegenerate = vi.fn();
      setWidgetState(new DoneState('ok', mockOnInsert, mockOnDiscard, mockOnRegenerate));
      render(<AiWidget />);
      expect(screen.getByRole('button', { name: 'Rigenera' })).toBeInTheDocument();
    });

    it('NON mostra il pulsante Rigenera se onRegenerate non è definito', () => {
      setWidgetState(new DoneState('ok', mockOnInsert, mockOnDiscard));
      render(<AiWidget />);
      expect(screen.queryByRole('button', { name: 'Rigenera' })).not.toBeInTheDocument();
    });

    it('chiama onRegenerate quando si clicca Rigenera', () => {
      const mockOnRegenerate = vi.fn();
      setWidgetState(new DoneState('ok', mockOnInsert, mockOnDiscard, mockOnRegenerate));
      render(<AiWidget />);
      fireEvent.click(screen.getByRole('button', { name: 'Rigenera' }));
      expect(mockOnRegenerate).toHaveBeenCalled();
    });
  });

  // ─── ErrorState ────────────────────────────────────────────────────────────

  describe('ErrorState', () => {
    const mockOnDiscard = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('mostra il messaggio di errore', () => {
      setWidgetState(new ErrorState('Connessione persa', mockOnDiscard));
      render(<AiWidget />);
      expect(screen.getByText('Connessione persa')).toBeInTheDocument();
    });

    it('mostra il pulsante Scarta', () => {
      setWidgetState(new ErrorState('Errore generico', mockOnDiscard));
      render(<AiWidget />);
      expect(screen.getByRole('button', { name: 'Scarta' })).toBeInTheDocument();
    });

    it('chiama onDiscard quando si clicca Scarta', () => {
      setWidgetState(new ErrorState('Errore', mockOnDiscard));
      render(<AiWidget />);
      fireEvent.click(screen.getByRole('button', { name: 'Scarta' }));
      expect(mockOnDiscard).toHaveBeenCalled();
    });
  });

  // ─── InputState ────────────────────────────────────────────────────────────

  describe('InputState', () => {
    const mockOnConfirm = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
      useAiWidgetStore.getState().setPrompt('');
    });

    it('mostra la textarea per il prompt', () => {
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel));
      render(<AiWidget />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('mostra il pulsante Annulla', () => {
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel));
      render(<AiWidget />);
      expect(screen.getByRole('button', { name: 'Annulla' })).toBeInTheDocument();
    });

    it('il pulsante Invia è disabilitato se il prompt è vuoto', () => {
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel));
      render(<AiWidget />);
      expect(screen.getByRole('button', { name: 'Invia' })).toBeDisabled();
    });

    it('il pulsante Invia si abilita quando viene digitato del testo', () => {
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel));
      render(<AiWidget />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Scrivi qualcosa' } });
      expect(screen.getByRole('button', { name: 'Invia' })).not.toBeDisabled();
    });

    it('chiama onConfirm con il testo inserito quando si clicca Invia', () => {
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel));
      render(<AiWidget />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Il mio prompt' } });
      fireEvent.click(screen.getByRole('button', { name: 'Invia' }));
      expect(mockOnConfirm).toHaveBeenCalledWith('Il mio prompt');
    });

    it('chiama onCancel quando si clicca Annulla', () => {
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel));
      render(<AiWidget />);
      fireEvent.click(screen.getByRole('button', { name: 'Annulla' }));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('prepopola la textarea con initialPrompt se fornito', () => {
      useAiWidgetStore.getState().setPrompt('Prompt iniziale');
      setWidgetState(new InputState(mockOnConfirm, mockOnCancel, 'Prompt iniziale'));
      render(<AiWidget />);
      expect(screen.getByRole('textbox')).toHaveValue('Prompt iniziale');
    });
  });

  // ─── Header e struttura ────────────────────────────────────────────────────

  describe('Struttura del widget', () => {
    it('mostra sempre il titolo "Generazione AI" quando visibile', () => {
      setWidgetState(new LoadingState());
      render(<AiWidget />);
      expect(screen.getByText('Generazione AI')).toBeInTheDocument();
    });

    it('è posizionato con le coordinate fornite da useDraggable', () => {
      setWidgetState(new LoadingState());
      const { container } = render(<AiWidget />);
      const widget = container.querySelector('[style*="position: fixed"]');
      expect(widget).toHaveStyle({ left: '100px', top: '100px' });
    });
  });
});