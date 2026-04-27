import React from 'react'
import { IWidgetState } from './IWidgetState'
import styles from '../AiWidget.module.css'

export class DoneState implements IWidgetState {
  constructor(
    private readonly result: string,
    private readonly onInsert: (text: string) => void,
    private readonly onDiscard: () => void,
    private readonly onRegenerate?: () => void,
  ) {}

  render() {
    return <div>{this.result}</div>
  }

  renderActions() {
    return (
      <>
        <button className={styles.btn_confirm} onClick={() => this.onInsert(this.result)}>Inserisci</button>
        {this.onRegenerate && (
          <button onClick={this.onRegenerate}>Rigenera</button>
        )}
        <button className={styles.btn_cancel} onClick={this.onDiscard}>Scarta</button>
      </>
    )
  }
}