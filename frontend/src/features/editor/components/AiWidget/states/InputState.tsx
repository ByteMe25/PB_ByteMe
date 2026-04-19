import React, { useEffect } from 'react'
import { IWidgetState } from './IWidgetState'
import { useAiWidgetStore } from '../aiWidgetStore'
import styles from '../AiWidget.module.css'

export class InputState implements IWidgetState {
  constructor(
    private readonly onConfirm: (prompt: string) => void,
    private readonly onCancel: () => void,
    private readonly initialPrompt: string = '',
  ) {}

  render() {
    return <InputStateView onConfirm={this.onConfirm} initialPrompt={this.initialPrompt} />
  }

  renderActions() {
    return <button className={styles.btn_cancel} onClick={this.onCancel}>Annulla</button>
  }
}

function InputStateView({ onConfirm, initialPrompt }: {
  onConfirm: (prompt: string) => void
  initialPrompt: string
}) {
  const { prompt, setPrompt } = useAiWidgetStore()

  useEffect(() => { setPrompt(initialPrompt) }, [])

  return (
    <>
      <textarea
        className={styles.prompt_textarea}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Descrivi qualcosa per iniziare la generazione…"
      />
      <button
        className={styles.btn_confirm}
        onClick={() => onConfirm(prompt)}
        disabled={!prompt.trim()}
      >
        Invia
      </button>
    </>
  )
}