import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiPanel } from './AiPanel';
import { useAiOperations } from '../../hooks/useAiOperations';
import { useAiWidgetStore } from '../AiWidget/aiWidgetStore';
import { IdleState } from '../AiWidget/states/IdleState';
import { LoadingState } from '../AiWidget/states/LoadingState';

// Test di useAiOperations visibili nel relativo file, qui viene mockato
vi.mock('../../hooks/useAiOperations', () => ({
  useAiOperations: vi.fn(),
}));

const mockHandleAction = vi.fn();
const mockHandleDistantWriting = vi.fn();

const defaultProps = {
  getEditorText: vi.fn().mockReturnValue(''),
  getSelection: vi.fn().mockReturnValue(''),
  insertTextAtCursor: vi.fn(),
  onClose: vi.fn(),
  onEntryAdded: vi.fn(),
};

const renderAiPanel = (props = {}) => {
  return render(<AiPanel {...defaultProps} {...props} />);
};

describe('AiPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => { useAiWidgetStore.getState().reset(); });

    vi.mocked(useAiOperations).mockReturnValue({
      handleAction: mockHandleAction,
      handleDistantWriting: mockHandleDistantWriting,
    });
  });

  // ─── Rendering iniziale ───────────────────────────────────────────────────

  describe('Rendering iniziale', () => {
    it('mostra tutti i bottoni principali', () => {
      renderAiPanel();

      expect(screen.getByRole('button', { name: 'Riassumi il testo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Riscrivi il testo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Correggi grammatica' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Traduci' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sei Cappelli' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Distant Writing' })).toBeInTheDocument();
    });

    it('mostra il pulsante di chiusura', () => {
      renderAiPanel();
      expect(screen.getByRole('button', { name: 'Chiudi pannello AI' })).toBeInTheDocument();
    });

    it('i sottomenu di Traduci e Sei Cappelli non sono visibili all\'avvio', () => {
      renderAiPanel();
      expect(screen.queryByRole('button', { name: 'Inglese' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cappello Bianco' })).not.toBeInTheDocument();
    });
  });

  // ─── Chiusura pannello ────────────────────────────────────────────────────

  describe('Chiusura pannello', () => {
    it('chiama onClose quando si clicca il pulsante X', () => {
      const onClose = vi.fn();
      renderAiPanel({ onClose });
      fireEvent.click(screen.getByRole('button', { name: 'Chiudi pannello AI' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Bottoni semplici (senza sottomenu) ───────────────────────────────────

  describe('Bottoni semplici', () => {
    it('chiama handleAction("summary") al click su Riassumi', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Riassumi il testo' }));
      expect(mockHandleAction).toHaveBeenCalledWith('summary');
    });

    it('chiama handleAction("rewrite") al click su Riscrivi', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Riscrivi il testo' }));
      expect(mockHandleAction).toHaveBeenCalledWith('rewrite');
    });

    it('chiama handleAction("fix_grammar") al click su Correggi grammatica', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Correggi grammatica' }));
      expect(mockHandleAction).toHaveBeenCalledWith('fix_grammar');
    });

    it('chiama handleAction("distant_writing") al click su Distant Writing', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Distant Writing' }));
      expect(mockHandleAction).toHaveBeenCalledWith('distant_writing');
    });
  });

  // ─── Sottomenu Traduci ────────────────────────────────────────────────────

  describe('Sottomenu Traduci', () => {
    it('mostra le lingue dopo aver cliccato Traduci', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Traduci' }));
      expect(screen.getByRole('button', { name: 'Inglese' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Italiano' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Spagnolo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tedesco' })).toBeInTheDocument();
    });

    it('nasconde le lingue al secondo click su Traduci (toggle)', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Traduci' }));
      fireEvent.click(screen.getByRole('button', { name: 'Traduci' }));
      expect(screen.queryByRole('button', { name: 'Inglese' })).not.toBeInTheDocument();
    });

    it('chiama handleAction con l\'operazione corretta al click su una lingua', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Traduci' }));
      fireEvent.click(screen.getByRole('button', { name: 'Inglese' }));
      expect(mockHandleAction).toHaveBeenCalledWith('translate_en');
    });

    it('chiude il sottomenu dopo aver scelto una lingua', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Traduci' }));
      fireEvent.click(screen.getByRole('button', { name: 'Inglese' }));
      expect(screen.queryByRole('button', { name: 'Inglese' })).not.toBeInTheDocument();
    });
  });

  // ─── Sottomenu Sei Cappelli ───────────────────────────────────────────────

  describe('Sottomenu Sei Cappelli', () => {
    it('mostra i cappelli dopo aver cliccato Sei Cappelli', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Sei Cappelli' }));
      expect(screen.getByRole('button', { name: 'Cappello Bianco' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cappello Rosso' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cappello Nero' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cappello Giallo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cappello Verde' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cappello Blu' })).toBeInTheDocument();
    });

    it('chiama handleAction con l\'operazione corretta al click su un cappello', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Sei Cappelli' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cappello Verde' }));
      expect(mockHandleAction).toHaveBeenCalledWith('green_hat');
    });

    it('chiude il sottomenu dopo aver scelto un cappello', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Sei Cappelli' }));
      fireEvent.click(screen.getByRole('button', { name: 'Cappello Rosso' }));
      expect(screen.queryByRole('button', { name: 'Cappello Rosso' })).not.toBeInTheDocument();
    });
  });

  // ─── Stato disabilitato (generazione in corso) ────────────────────────────

  describe('Bottoni disabilitati durante la generazione', () => {
    beforeEach(() => {
      useAiWidgetStore.getState().changeState(new LoadingState());
    });

    it('disabilita tutti i bottoni principali quando il widget non è Idle', () => {
      renderAiPanel();
      const buttons = [
        screen.getByRole('button', { name: 'Riassumi il testo' }),
        screen.getByRole('button', { name: 'Riscrivi il testo' }),
        screen.getByRole('button', { name: 'Correggi grammatica' }),
        screen.getByRole('button', { name: 'Traduci' }),
        screen.getByRole('button', { name: 'Sei Cappelli' }),
        screen.getByRole('button', { name: 'Distant Writing' }),
      ];
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    it('Non chiama handleAction se si clicca un bottone disabilitato', () => {
      renderAiPanel();
      fireEvent.click(screen.getByRole('button', { name: 'Riassumi il testo' }));
      expect(mockHandleAction).not.toHaveBeenCalled();
    });

    it('i bottoni tornano abilitati quando lo stato torna Idle', () => {
      renderAiPanel();
      expect(screen.getByRole('button', { name: 'Riassumi il testo' })).toBeDisabled();

      act(() => { useAiWidgetStore.getState().reset(); });

      expect(screen.getByRole('button', { name: 'Riassumi il testo' })).not.toBeDisabled();
    });
  });

  // ─── Passaggio delle props a useAiOperations ──────────────────────────────

  describe('Integrazione con useAiOperations', () => {
    it('passa getEditorText, getSelection, insertTextAtCursor e onEntryAdded all\'hook', () => {
      const getEditorText = vi.fn();
      const getSelection = vi.fn();
      const insertTextAtCursor = vi.fn();
      const onEntryAdded = vi.fn();

      renderAiPanel({ getEditorText, getSelection, insertTextAtCursor, onEntryAdded });

      expect(vi.mocked(useAiOperations)).toHaveBeenCalledWith(
        expect.objectContaining({
          getEditorText,
          getSelection,
          insertText: insertTextAtCursor,
          onEntryAdded,
        })
      );
    });
  });
});