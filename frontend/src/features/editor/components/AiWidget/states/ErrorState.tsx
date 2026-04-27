import React from 'react'
import { IWidgetState } from './IWidgetState'
import {MessageSquareWarning} from 'lucide-react'
import styles from '../AiWidget.module.css'

export class ErrorState implements IWidgetState {
  constructor(
    private readonly message: string,
    private readonly onDiscard: () => void
  ) {}

  render() {
    return (
      <>
        <MessageSquareWarning size={25} color="#d32f2f" />
        <span className={styles.error_message}>{this.message}</span>
      </>
    )
  }

  renderActions() {
    return (
      <>
        <button className={styles.btn_cancel} onClick={this.onDiscard}>Annulla</button>
      </>
    )
  }
}