import { useState, useRef, useCallback } from 'react'

export function useDraggable(initialX = 100, initialY = 200) {
  const [pos, setPos] = useState({ x: initialX, y: initialY })
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      })
    }

    const onMouseUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [pos])

  return { pos, onMouseDown }
}