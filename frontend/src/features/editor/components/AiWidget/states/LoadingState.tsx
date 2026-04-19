import React from 'react'
import { IWidgetState } from './IWidgetState'

export class LoadingState implements IWidgetState {
  render() {
    return (
      <>
        <span>Loading…</span>
      </>
    )
  }
}