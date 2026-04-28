// src/features/editor/hooks/useDraggable.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDraggable } from './useDraggable';

const mouseDown = (element: EventTarget, clientX: number, clientY: number) =>
  act(() => {
    element.dispatchEvent(
      new MouseEvent('mousedown', { clientX, clientY, bubbles: true })
    );
  });

const mouseMove = (clientX: number, clientY: number) =>
  act(() => {
    window.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
  });

const mouseUp = () =>
  act(() => {
    window.dispatchEvent(new MouseEvent('mouseup'));
  });

describe('useDraggable Hook', () => {

  // ─── Trascinamento ────────────────────────────────────────────────────────

  describe('Trascinamento', () => {
    it('aggiorna la posizione durante il mousemove dopo il mousedown', () => {
      const { result } = renderHook(() => useDraggable(0, 0));

      act(() => {
        result.current.onMouseDown({ clientX: 10, clientY: 20 } as React.MouseEvent);
      });

      mouseMove(50, 80);

      expect(result.current.pos).toEqual({ x: 40, y: 60 });
    });

    it('calcola correttamente l\'offset rispetto alla posizione iniziale', () => {
      const { result } = renderHook(() => useDraggable(100, 100));

      act(() => {
        result.current.onMouseDown({ clientX: 120, clientY: 130 } as React.MouseEvent);
      });

      mouseMove(200, 200);

      expect(result.current.pos).toEqual({ x: 180, y: 170 });
    });

    it('aggiorna la posizione su più mousemove consecutivi', () => {
      const { result } = renderHook(() => useDraggable(0, 0));

      act(() => {
        result.current.onMouseDown({ clientX: 0, clientY: 0 } as React.MouseEvent);
      });

      mouseMove(10, 10);
      expect(result.current.pos).toEqual({ x: 10, y: 10 });

      mouseMove(50, 30);
      expect(result.current.pos).toEqual({ x: 50, y: 30 });
    });
  });

  // ─── Fine trascinamento ───────────────────────────────────────────────────

  describe('Fine trascinamento (mouseup)', () => {
    it('smette di aggiornare la posizione dopo il mouseup', () => {
      const { result } = renderHook(() => useDraggable(0, 0));

      act(() => {
        result.current.onMouseDown({ clientX: 0, clientY: 0 } as React.MouseEvent);
      });

      mouseMove(50, 50);
      expect(result.current.pos).toEqual({ x: 50, y: 50 });

      mouseUp();
      mouseMove(200, 200);

      expect(result.current.pos).toEqual({ x: 50, y: 50 });
    });

    it('rimuove i listener da window dopo il mouseup', () => {
      const { result } = renderHook(() => useDraggable(0, 0));
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      act(() => {
        result.current.onMouseDown({ clientX: 0, clientY: 0 } as React.MouseEvent);
      });

      mouseUp();

      expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      removeSpy.mockRestore();
    });
  });

  // ─── Listener su window ───────────────────────────────────────────────────

  describe('Gestione listener su window', () => {
    it('non aggiorna la posizione se il mousemove arriva senza un mousedown precedente', () => {
      const { result } = renderHook(() => useDraggable(100, 100));

      mouseMove(999, 999);

      expect(result.current.pos).toEqual({ x: 100, y: 100 });
    });

    it('aggiunge i listener a window al mousedown', () => {
      const { result } = renderHook(() => useDraggable(0, 0));
      const addSpy = vi.spyOn(window, 'addEventListener');

      act(() => {
        result.current.onMouseDown({ clientX: 0, clientY: 0 } as React.MouseEvent);
      });

      expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      addSpy.mockRestore();
      mouseUp();
    });
  });
});