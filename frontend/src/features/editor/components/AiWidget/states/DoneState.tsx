import React from 'react'
import { IWidgetState } from './IWidgetState'

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
        <button onClick={() => this.onInsert(this.result)}>Inserisci</button>
        {this.onRegenerate && (
          <button onClick={this.onRegenerate}>Rigenera</button>
        )}
        <button onClick={this.onDiscard}>Scarta</button>
      </>
    )
  }
}