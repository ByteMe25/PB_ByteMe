import React from 'react'
import { useAiWidgetStore } from './aiWidgetStore'
import styles from './AiWidget.module.css'
import { Sparkles } from 'lucide-react'
import { useDraggable } from '../../hooks/useDraggable'
import { IdleState } from './states/IdleState'

export function AiWidget() {
    const widgetState = useAiWidgetStore((s) => s.widgetState)
    const { pos, onMouseDown } = useDraggable(100, 200)

    if (widgetState instanceof IdleState) return null

    return (
        <div className={styles.ai_widget} style={{ position: 'fixed', left: pos.x, top: pos.y }}>
            <div className={styles.header} onMouseDown={onMouseDown}>
                <h3>Generazione AI</h3>
                <Sparkles size={22} />
            </div>
            <div className={styles.body}>
                {widgetState.render()}
            </div>
            <div className={styles.actions}>
                { widgetState.renderActions?.() }
            </div>
        </div>
    )
}