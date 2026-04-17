import { useState } from "react";
import { aiCall } from "../api/aiCall";
import type { AiOperationId } from "../api/aiCall";

interface UseAiOperationsProps {
  getEditorText: () => string;
  getSelection: () => string;
  insertText: (text: string) => void;
  onEntryAdded?: (entry: unknown) => void;
}

export const useAiOperations = ({ getEditorText, getSelection, insertText, onEntryAdded }: UseAiOperationsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (operation: AiOperationId): Promise<void> => {

    // usa la selezione se presente, altrimenti tutto il testo
    const text = getSelection() || getEditorText();

    setIsLoading(true);
    try {
      const result = await aiCall.executeOperation({operationId: operation, text});
      insertText(result);
      onEntryAdded?.({ operation, input: text, output: result, timestamp: Date.now() });
    } catch (err) {
      console.error("Errore:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleAction, isLoading };
};