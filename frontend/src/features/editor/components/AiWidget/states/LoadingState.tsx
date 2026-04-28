import React from 'react'
import { IWidgetState } from './IWidgetState'
import styles from '../AiWidget.module.css'

export class LoadingState implements IWidgetState {
  constructor(private readonly onCancel?: () => void) {}
  render() {
    return (
      <div className={styles.loading}>
        <div className={styles.loader} />
        <span>Loading…</span>
      </div>
    )
  }

  renderActions() {
    if (!this.onCancel) return null
    return (
      <button className={styles.btn_cancel} onClick={this.onCancel}>Annulla</button>
    )
  }
}