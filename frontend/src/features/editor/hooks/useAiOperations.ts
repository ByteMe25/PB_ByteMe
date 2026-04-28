import { useRef } from "react";
import { aiCall } from "../api/aiCall";
import type { AiOperationId } from "../api/aiCall";
import { useAiWidgetStore } from "../components/AiWidget/aiWidgetStore";
import { LoadingState } from "../components/AiWidget/states/LoadingState";
import { DoneState } from "../components/AiWidget/states/DoneState";
import { IdleState } from "../components/AiWidget/states/IdleState";
import { ErrorState } from "../components/AiWidget/states/ErrorState";
import { InputState } from "../components/AiWidget/states/InputState";
import axios from "axios";

interface UseAiOperationsProps {
  getEditorText: () => string;
  getSelection: () => string;
  insertText: (text: string) => void;
  onEntryAdded?: (entry: unknown) => void;
}

export const useAiOperations = ({ getEditorText, getSelection, insertText, onEntryAdded }: UseAiOperationsProps) => {
  const changeState = useAiWidgetStore((s) => s.changeState);
  const controllerRef = useRef<AbortController | null>(null);

  const abort = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  };

  const handleCancel = () => {
    abort();
    changeState(new IdleState());
  };

  const runOperation = async (
    params: Parameters<typeof aiCall.executeOperation>[0],
    onRegenerate: () => void,
    entryMeta: Record<string, unknown>,
  ): Promise<void> => {
    abort();
    controllerRef.current = new AbortController();
    changeState(new LoadingState(handleCancel));
    try {
      const result = await aiCall.executeOperation(params, controllerRef.current.signal);
      onEntryAdded?.({ ...entryMeta, generatedText: result, timestamp: Date.now() });
      changeState(new DoneState(
        result,
        (text) => { insertText(text); changeState(new IdleState()); },
        () => changeState(new IdleState()),
        onRegenerate,
      ));
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Errore:", err);
      changeState(new ErrorState(err instanceof Error ? err.message : "Errore sconosciuto", () => changeState(new IdleState())));
    }
  };

  const executeOperation = (operation: AiOperationId, text: string) =>
    runOperation(
      { operationId: operation, text },
      () => executeOperation(operation, text),
      { operation, inputText: text },
    );

  const handleDistantWriting = () => {
    const onConfirm = (prompt: string) => {
      const context = getSelection() || getEditorText();
      runOperation(
        { operationId: "distant_writing", text: context, prompt },
        () => changeState(new InputState(onConfirm, () => changeState(new IdleState()), prompt)),
        { operation: "distant_writing", inputText: context },
      );
    };
    changeState(new InputState(onConfirm, () => changeState(new IdleState())));
  };

  const handleAction = (operation: AiOperationId): void => {
    if (operation === "distant_writing") {
      handleDistantWriting();
      return;
    }
    const text = getSelection() || getEditorText();
    executeOperation(operation, text);
  };

  return { handleAction };
};