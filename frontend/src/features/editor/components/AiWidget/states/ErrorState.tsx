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
        <MessageSquareWarning size={22}/>
        <span className={styles.error_message}>{this.message}</span>
      </>
    )
  }

  renderActions() {
    return (
      <>
        <button onClick={this.onDiscard}>Scarta</button>
      </>
    )
  }
}