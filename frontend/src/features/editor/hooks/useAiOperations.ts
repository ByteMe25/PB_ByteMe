import { aiCall } from "../api/aiCall";
import type { AiOperationId } from "../api/aiCall";
import { useAiWidgetStore } from "../components/AiWidget/aiWidgetStore";
import { LoadingState } from "../components/AiWidget/states/LoadingState";
import { DoneState } from "../components/AiWidget/states/DoneState";
import { IdleState } from "../components/AiWidget/states/IdleState";
import { ErrorState } from "../components/AiWidget/states/ErrorState";
import { InputState } from "../components/AiWidget/states/InputState";

interface UseAiOperationsProps {
  getEditorText: () => string;
  getSelection: () => string;
  insertText: (text: string) => void;
  onEntryAdded?: (entry: unknown) => void;
}

export const useAiOperations = ({ getEditorText, getSelection, insertText, onEntryAdded }: UseAiOperationsProps) => {
  const changeState = useAiWidgetStore((s) => s.changeState);

  const handleAction = async (operation: AiOperationId): Promise<void> => {

    if (operation === "distant_writing") {
      handleDistantWriting();
      return;
    }

    const text = getSelection() || getEditorText();

    changeState(new LoadingState());
    try {
      const result = await aiCall.executeOperation({ operationId: operation, text });
      onEntryAdded?.({ operation, input: text, output: result, timestamp: Date.now() });
      changeState(new DoneState(
        result,
        (text) => { insertText(text); changeState(new IdleState()) },
        () => changeState(new IdleState())
      ));
    } catch (err) {
      console.error("Errore:", err);
      changeState(new ErrorState(err instanceof Error ? err.message : "Errore sconosciuto", () => changeState(new InputState(onConfirm, () => changeState(new IdleState()), prompt))));
    }
  };

  const handleDistantWriting = () => {
    const onConfirm = async (prompt: string) => {
      const context = getSelection() || getEditorText();

      changeState(new LoadingState());
      try {
        const result = await aiCall.executeOperation({ operationId: "distant_writing", text: context, prompt });
        onEntryAdded?.({ operation: "distant_writing", input: context, output: result, timestamp: Date.now() });
        changeState(new DoneState(
          result,
          (text) => { insertText(text); changeState(new IdleState()) },
          () => changeState(new IdleState()),
          () => changeState(new InputState(onConfirm, () => changeState(new IdleState()), prompt))
        ));
      } catch (err) {
        console.error("Errore:", err);
        changeState(new ErrorState(err instanceof Error ? err.message : "Errore sconosciuto", () => changeState(new InputState(onConfirm, () => changeState(new IdleState()), prompt))));
      }
    };

    changeState(new InputState(onConfirm, () => changeState(new IdleState())));
  };

  return { handleAction, handleDistantWriting };
};