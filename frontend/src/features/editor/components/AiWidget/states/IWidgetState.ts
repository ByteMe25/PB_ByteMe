import React from 'react'

export interface IWidgetState {
  render(): React.ReactNode
  renderActions?(): React.ReactNode
}