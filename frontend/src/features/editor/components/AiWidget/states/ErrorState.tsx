import React from 'react'
import { IWidgetState } from './IWidgetState'
import {MessageSquareWarning} from 'lucide-react'

export class ErrorState implements IWidgetState {
  constructor(
    private readonly message: string,
    private readonly onDiscard: () => void
  ) {}

  render() {
    return (
      <>
        <MessageSquareWarning size={22}/>
        <span>{this.message}</span>
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