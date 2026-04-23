// src/features/editor/hooks/useAiOperations.test.ts
import React from 'react';
import { renderHook, render, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiOperations } from './useAiOperations';
import { aiCall } from '../api/aiCall';
import { useAiWidgetStore } from '../components/AiWidget/aiWidgetStore';
import { LoadingState } from '../components/AiWidget/states/LoadingState';
import { DoneState } from '../components/AiWidget/states/DoneState';
import { ErrorState } from '../components/AiWidget/states/ErrorState';
import { InputState } from '../components/AiWidget/states/InputState';
import { IdleState } from '../components/AiWidget/states/IdleState';
import axios from 'axios';


vi.mock('../api/aiCall', () => ({
  aiCall: {
    executeOperation: vi.fn(),
  },
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      isCancel: vi.fn((err) => err?.name === 'CanceledError' || err?.message === 'canceled'),
    },
  };
});

const mockGetEditorText = vi.fn().mockReturnValue('Testo del documento');
const mockGetSelection = vi.fn().mockReturnValue('');
const mockInsertText = vi.fn();
const mockOnEntryAdded = vi.fn();

const renderAiOperationsHook = (overrides = {}) =>
  renderHook(() =>
    useAiOperations({
      getEditorText: mockGetEditorText,
      getSelection: mockGetSelection,
      insertText: mockInsertText,
      onEntryAdded: mockOnEntryAdded,
      ...overrides,
    })
  );

const getWidgetState = () => useAiWidgetStore.getState().widgetState;

describe('useAiOperations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {useAiWidgetStore.getState().reset();});
  });

  // ─── Selezione del testo ─────────────────────────────────────────────────

  describe('Priorità testo sorgente', () => {
    it('usa la selezione se presente', async () => {
      mockGetSelection.mockReturnValueOnce('Testo selezionato');
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Risultato');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      expect(aiCall.executeOperation).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Testo selezionato' }),
        expect.any(AbortSignal)
      );
    });

    it('usa il testo intero se la selezione è vuota', async () => {
      mockGetSelection.mockReturnValueOnce('');
      mockGetEditorText.mockReturnValueOnce('Intero documento');
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Risultato');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      expect(aiCall.executeOperation).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Intero documento' }),
        expect.any(AbortSignal)
      );
    });
  });

  // ─── Flusso happy path ────────────────────────────────────────────────────

  describe('handleAction - operazione generica', () => {
    it('imposta LoadingState prima di chiamare aiCall', async () => {
      let resolve!: (v: string) => void;
      vi.mocked(aiCall.executeOperation).mockReturnValueOnce(
        new Promise((r) => (resolve = r))
      );

      const { result } = renderAiOperationsHook();

      act(() => {
        result.current.handleAction('rewrite');
      });

      expect(getWidgetState()).toBeInstanceOf(LoadingState);
      resolve('ok');
    });

    it('imposta DoneState con il risultato dopo una chiamata riuscita', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Testo riscritto');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('rewrite');
      });

      expect(getWidgetState()).toBeInstanceOf(DoneState);
    });

    it('chiama onEntryAdded con i metadati corretti dopo il successo', async () => {
      mockGetSelection.mockReturnValueOnce('Input');
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Output');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('fix_grammar');
      });

      expect(mockOnEntryAdded).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'fix_grammar',
          inputText: 'Input',
          generatedText: 'Output',
          timestamp: expect.any(Number),
        })
      );
    });

    it('imposta ErrorState se aiCall lancia un errore', async () => {
      vi.mocked(aiCall.executeOperation).mockRejectedValueOnce(
        new Error('Timeout del server')
      );

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      expect(getWidgetState()).toBeInstanceOf(ErrorState);
    });

    it('usa il messaggio dell\'errore originale nello ErrorState', async () => {
      vi.mocked(aiCall.executeOperation).mockRejectedValueOnce(
        new Error('Errore 503')
      );

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      const state = getWidgetState() as ErrorState;
      expect(JSON.stringify(state.render())).toContain('Errore 503');
    });

    it('usa un messaggio generico se l\'errore non è un\'istanza di Error', async () => {
      vi.mocked(aiCall.executeOperation).mockRejectedValueOnce('stringa di errore');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      const state = getWidgetState() as ErrorState;
      expect(JSON.stringify(state.render())).toContain('Errore sconosciuto');
    });

    it('passa correttamente l\'operationId ad aiCall', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('ok');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('translate_en');
      });

      expect(aiCall.executeOperation).toHaveBeenCalledWith(
        expect.objectContaining({ operationId: 'translate_en' }),
        expect.any(AbortSignal)
      );
    });
  });

  // ─── distant_writing ─────────────────────────────────────────────────────

  describe('handleAction("distant_writing")', () => {
    it('imposta InputState (non chiama aiCall direttamente)', () => {
      const { result } = renderAiOperationsHook();

      act(() => {
        result.current.handleAction('distant_writing');
      });

      expect(getWidgetState()).toBeInstanceOf(InputState);
      expect(aiCall.executeOperation).not.toHaveBeenCalled();
    });

    it('chiama aiCall con il prompt inserito dopo la conferma', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Articolo generato');

      const { result } = renderAiOperationsHook();
      act(() => {
        result.current.handleAction('distant_writing');
      });

      const inputState = getWidgetState() as InputState;
      const { getByRole, getByPlaceholderText } = render(<>{inputState.render()}</>);
      fireEvent.change(getByPlaceholderText(/Descrivi qualcosa/i), {
        target: { value: 'Scrivi un articolo su React' },
      });
      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Invia' }));
      });

      expect(aiCall.executeOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          operationId: 'distant_writing',
          prompt: 'Scrivi un articolo su React',
        }),
        expect.any(AbortSignal)
      );
    });

    it('imposta DoneState con pulsante Rigenera dopo distant_writing riuscito', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Risultato distante');

      const { result } = renderAiOperationsHook();
      act(() => {
        result.current.handleAction('distant_writing');
      });

      const inputState = getWidgetState() as InputState;
      const { getByRole, getByPlaceholderText } = render(<>{inputState.render()}</>);
      fireEvent.change(getByPlaceholderText(/Descrivi qualcosa/i), {
        target: { value: 'Qualsiasi prompt' },
      });
      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Invia' }));
      });

      const doneState = getWidgetState() as DoneState;
      const { queryByRole } = render(<>{doneState.renderActions()}</>);
      expect(queryByRole('button', { name: 'Rigenera' })).toBeInTheDocument();
    });

    it('torna a InputState con il prompt precedente quando si clicca Rigenera', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Primo risultato');

      const { result } = renderAiOperationsHook();
      act(() => {
        result.current.handleAction('distant_writing');
      });

      const inputState = getWidgetState() as InputState;
      const { getByRole, getByPlaceholderText } = render(<>{inputState.render()}</>);
      fireEvent.change(getByPlaceholderText(/Descrivi qualcosa/i), {
        target: { value: 'Prompt originale' },
      });
      await act(async () => {
        fireEvent.click(getByRole('button', { name: 'Invia' }));
      });

      const doneState = getWidgetState() as DoneState;
      const { getByRole: getByRoleDone } = render(<>{doneState.renderActions()}</>);
      act(() => {
        fireEvent.click(getByRoleDone('button', { name: 'Rigenera' }));
      });

      expect(getWidgetState()).toBeInstanceOf(InputState);
    });
  });

  // ─── handleDistantWriting (esposto direttamente) ──────────────────────────

  describe('handleDistantWriting', () => {
    it('imposta subito InputState senza parametri iniziali', () => {
      const { result } = renderAiOperationsHook();

      act(() => {
        result.current.handleDistantWriting();
      });

      expect(getWidgetState()).toBeInstanceOf(InputState);
    });
  });

  // ─── Transizioni di stato via callback del DoneState ─────────────────────

  describe('Callback del DoneState', () => {
    it('chiama insertText con il testo generato quando si clicca Inserisci', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Testo finale');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('rewrite');
      });

      const doneState = getWidgetState() as DoneState;
      const { getByRole } = render(<>{doneState.renderActions()}</>);
      fireEvent.click(getByRole('button', { name: 'Inserisci' }));

      expect(mockInsertText).toHaveBeenCalledWith('Testo finale');
    });

    it('torna a IdleState dopo aver cliccato Inserisci', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('Testo finale');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('rewrite');
      });

      const doneState = getWidgetState() as DoneState;
      const { getByRole } = render(<>{doneState.renderActions()}</>);
      act(() => {
        fireEvent.click(getByRole('button', { name: 'Inserisci' }));
      });

      expect(getWidgetState()).toBeInstanceOf(IdleState);
    });

    it('torna a IdleState dopo aver cliccato Scarta', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('ok');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      const doneState = getWidgetState() as DoneState;
      const { getByRole } = render(<>{doneState.renderActions()}</>);
      act(() => {
        fireEvent.click(getByRole('button', { name: 'Scarta' }));
      });

      expect(getWidgetState()).toBeInstanceOf(IdleState);
    });

    it('NON chiama insertText quando si clicca Scarta', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('ok');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      const doneState = getWidgetState() as DoneState;
      const { getByRole } = render(<>{doneState.renderActions()}</>);
      fireEvent.click(getByRole('button', { name: 'Scarta' }));

      expect(mockInsertText).not.toHaveBeenCalled();
    });
  });

  // ─── Annullamento (AbortSignal) ──────────────────────────────────────────

  describe('Annullamento della richiesta', () => {
    it('passa il signal ad aiCall', async () => {
      vi.mocked(aiCall.executeOperation).mockResolvedValueOnce('ok');

      const { result } = renderAiOperationsHook();
      await act(async () => {
        await result.current.handleAction('summary');
      });

      expect(aiCall.executeOperation).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(AbortSignal)
      );
    });

    it('torna a IdleState quando si clicca Annulla nel LoadingState', async () => {
      let rejectFn!: (err: unknown) => void;
      vi.mocked(aiCall.executeOperation).mockReturnValueOnce(
        new Promise((_, r) => (rejectFn = r))
      );

      const { result } = renderAiOperationsHook();
      act(() => {
        result.current.handleAction('summary');
      });

      const loadingState = getWidgetState() as LoadingState;
      const { getByRole } = render(<>{loadingState.renderActions()}</>);

      act(() => {
        fireEvent.click(getByRole('button', { name: 'Annulla' }));
      });

      await act(async () => {
        const cancelError = new Error('canceled');
        cancelError.name = 'CanceledError';
        rejectFn(cancelError);
      });

      expect(getWidgetState()).toBeInstanceOf(IdleState);
    });

    it('Non imposta ErrorState se la richiesta viene annullata', async () => {
      let rejectFn!: (err: unknown) => void;
      vi.mocked(aiCall.executeOperation).mockReturnValueOnce(
        new Promise((_, r) => (rejectFn = r))
      );

      const { result } = renderAiOperationsHook();
      act(() => {
        result.current.handleAction('summary');
      });

      const loadingState = getWidgetState() as LoadingState;
      const { getByRole } = render(<>{loadingState.renderActions()}</>);

      act(() => {
        fireEvent.click(getByRole('button', { name: 'Annulla' }));
      });

      await act(async () => {
        const cancelError = new Error('canceled');
        cancelError.name = 'CanceledError';
        rejectFn(cancelError);
      });

      expect(getWidgetState()).not.toBeInstanceOf(ErrorState);
    });
  });
});