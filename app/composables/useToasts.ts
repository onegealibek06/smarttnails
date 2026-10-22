export interface Toast {
  id: number
  text: string
  tone: 'success' | 'info'
}

let nextId = 1

export function useToasts() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function push(text: string, tone: Toast['tone'] = 'success', timeout = 4500) {
    const id = nextId++
    toasts.value = [...toasts.value, { id, text, tone }]
    setTimeout(() => dismiss(id), timeout)
  }

  return { toasts, push, dismiss }
}
