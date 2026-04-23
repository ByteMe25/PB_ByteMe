import { useRef } from "react";
import { aiCall } from "../api/aiCall";
import type { AiOperationId } from "../api/aiCall";
import { useAiWidgetStore } from "../components/AiWidget/aiWidgetStore";
import { LoadingState } from "../components/AiWidget/states/LoadingState";
import { DoneState } from "../components/AiWidget/states/DoneState";
import { IdleState } from "../components/AiWidget/states/IdleState";
import { ErrorState } from "../components/AiWidget/states/ErrorState";
import { InputState } from "../components/AiWidget/states/InputState";
import axios from "axios"

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

  const handleAction = async (operation: AiOperationId): Promise<void> => {

    if (operation === "distant_writing") {
      handleDistantWriting();
      return;
    }

    const text = getSelection() || getEditorText();

    abort();
    controllerRef.current = new AbortController();

    changeState(new LoadingState(handleCancel));
    try {
      const result = await aiCall.executeOperation({ operationId: operation, text }, controllerRef.current.signal);
      onEntryAdded?.({ operation, inputText: text, generatedText: result, timestamp: Date.now() });
      changeState(new DoneState(
        result,
        (text) => { insertText(text); changeState(new IdleState()) },
        () => changeState(new IdleState())
      ));
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Errore:", err);
      changeState(new ErrorState(err instanceof Error ? err.message : "Errore sconosciuto", () => changeState(new IdleState())));
    }
  };

  const handleDistantWriting = () => {
    const onConfirm = async (prompt: string) => {
      const context = getSelection() || getEditorText();

      abort();
      controllerRef.current = new AbortController();

      changeState(new LoadingState(handleCancel));
      try {
        const result = await aiCall.executeOperation({ operationId: "distant_writing", text: context, prompt }, controllerRef.current.signal);
        onEntryAdded?.({ operation: "distant_writing", inputText: context, generateText: result, timestamp: Date.now() });
        changeState(new DoneState(
          result,
          (text) => { insertText(text); changeState(new IdleState()) },
          () => changeState(new IdleState()),
          () => changeState(new InputState(onConfirm, () => changeState(new IdleState()), prompt))
        ));
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Errore:", err);
        changeState(new ErrorState(err instanceof Error ? err.message : "Errore sconosciuto", () => changeState(new IdleState())));
      }
    };

    changeState(new InputState(onConfirm, () => changeState(new IdleState())));
  };

  return { handleAction, handleDistantWriting };
};