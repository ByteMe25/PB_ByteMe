import { create } from 'zustand'
import { IWidgetState } from './states/IWidgetState'
import { IdleState } from './states/IdleState'

interface AiWidgetStore {
  widgetState: IWidgetState
  prompt: string
  changeState: (newState: IWidgetState) => void
  setPrompt: (prompt: string) => void
  reset: () => void
}

export const useAiWidgetStore = create<AiWidgetStore>((set) => ({
  widgetState: new IdleState(),
  prompt: '',
  changeState: (newState) => set({ widgetState: newState }),
  setPrompt: (prompt) => set({ prompt }),
  reset: () => set({ widgetState: new IdleState(), prompt: '' }),
}))