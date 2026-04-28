import { useState } from "react";
import { useAiOperations } from "../../hooks/useAiOperations";
import { EditorButton } from "../../../../components/EditorButton/EditorButton";
import type { AiOperationId } from "../../api/aiCall";
import { FileText, Pencil, Wrench, Earth, GraduationCap, X, PenTool } from 'lucide-react';
import styles from "./AiPanel.module.css"
import { useAiWidgetStore } from "../AiWidget/aiWidgetStore";
import { IdleState } from "../AiWidget/states/IdleState";

interface SubButton {
  id: string;
  icon: string;
  label: string;
  operation: AiOperationId;
}

interface ButtonConfig {
  id: string;
  icon: string;
  label: string;
  operation?: AiOperationId;
  subButtons?: SubButton[];
}

const BUTTONS: ButtonConfig[] = [
  { id: "summarize", icon: <FileText size={22} />, label: "Riassumi il testo", operation: "summary" },
  { id: "rewrite", icon: <Pencil size={22} />, label: "Riscrivi il testo", operation: "rewrite" },
  { id: "fix", icon: <Wrench size={22} />, label: "Correggi grammatica", operation: "fix_grammar" },
  {
    id: "translate", icon: <Earth size={22} />, label: "Traduci",
    subButtons: [
      { id: "translate_en", icon: "🇬🇧", label: "Inglese", operation: "translate_en" },
      { id: "translate_it", icon: "🇮🇹", label: "Italiano", operation: "translate_it" },
      { id: "translate_es", icon: "🇪🇸", label: "Spagnolo", operation: "translate_es" },
      { id: "translate_de", icon: "🇩🇪", label: "Tedesco", operation: "translate_de" },
      { id: "translate_fr", icon: "🇫🇷", label: "Francese", operation: "translate_fr" },
    ],
  },
  {
    id: "six_hats", icon: <GraduationCap size={22} />, label: "Sei Cappelli",
    subButtons: [
      { id: "white_hat", icon: <GraduationCap color="#fff" size={22} />, label: "Cappello Bianco", operation: "white_hat" },
      { id: "red_hat", icon: <GraduationCap color="#ff0000" size={22} />, label: "Cappello Rosso", operation: "red_hat" },
      { id: "black_hat", icon: <GraduationCap color="#000" size={22} />, label: "Cappello Nero", operation: "black_hat" },
      { id: "yellow_hat", icon: <GraduationCap color="#f0c807" size={22} />, label: "Cappello Giallo", operation: "yellow_hat" },
      { id: "green_hat", icon: <GraduationCap color="#008000" size={22} />, label: "Cappello Verde", operation: "green_hat" },
      { id: "blue_hat", icon: <GraduationCap color="#1656ad" size={22} />, label: "Cappello Blu", operation: "blue_hat" },
    ],
  },
  { id: "distant_writing", icon: <PenTool size={22} />, label: "Distant Writing", operation: "distant_writing" },
];

interface AiPanelProps {
  getEditorText: () => string;
  getSelection: () => string;
  insertTextAtCursor: (text: string) => void;
  onClose: () => void;
  onEntryAdded?: (entry: unknown) => void;
}

export const AiPanel = ({ getEditorText, getSelection, insertTextAtCursor, onClose, onEntryAdded }: AiPanelProps) => {
  const { handleAction } = useAiOperations({
    getEditorText,
    getSelection,
    insertText: insertTextAtCursor,
    onEntryAdded,
  });

  const widgetState = useAiWidgetStore((s) => s.widgetState);
  const isIdle = widgetState instanceof IdleState;

  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubAction = (operation: AiOperationId) => {
    handleAction(operation);
    setOpenMenus(new Set());
  };

  return (
    <div className={styles.aiPanel}>
      <button className={styles.close_btn} onClick={onClose} aria-label="Chiudi pannello AI"><X size={22} /></button>

      <div class="icon_separator" />

      {BUTTONS.map((btn) =>
        btn.subButtons ? (
          <div key={btn.id}>
            <div className={styles.button_wrapper} data-tooltip={!isIdle ? "Completa o scarta la generazione corrente" : undefined}>
              <EditorButton
                icon={btn.icon}
                label={btn.label}
                isActive={openMenus.has(btn.id)}
                disabled={!isIdle}
                onClick={() => toggleMenu(btn.id)}
              />
            </div>
            {openMenus.has(btn.id) && (
              <div>
                {btn.subButtons.map((sub) => (
                  <div className={styles.button_wrapper} data-tooltip={!isIdle ? "Completa o scarta la generazione corrente" : undefined}>
                    <EditorButton
                      icon={sub.icon}
                      label={sub.label}
                      disabled={!isIdle}
                      onClick={() => handleSubAction(sub.operation)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.button_wrapper} data-tooltip={!isIdle ? "Completa o scarta la generazione corrente" : undefined}>
            <EditorButton
              icon={btn.icon}
              label={btn.label}
              disabled={!isIdle}
              onClick={() => handleAction(btn.operation!)}
            />
          </div>
        )
      )}
    </div>
  );
};