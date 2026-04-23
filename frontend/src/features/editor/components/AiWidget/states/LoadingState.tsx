import React from 'react'
import { IWidgetState } from './IWidgetState'

export class LoadingState implements IWidgetState {
  constructor(private readonly onCancel?: () => void) {}
  render() {
    return (
      <>
        <span>Loading…</span>
      </>
    )
  }

  renderActions() {
    if (!this.onCancel) return null
    return (
      <button onClick={this.onCancel}>Annulla</button>
    )
  }
}