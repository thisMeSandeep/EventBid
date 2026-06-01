import { useCallback, useRef, useState } from 'react'
import { env } from '#/lib/env'

/**
 * Streams a text response from a POST SSE endpoint (Hono `streamSSE`), appending
 * each `data:` chunk to `text`. Browser sends the session cookie automatically.
 */
export function useStreamText() {
  const [text, setText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const start = useCallback(async (path: string, body: unknown) => {
    setText('')
    setIsStreaming(true)
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const res = await fetch(`${env.VITE_API_URL}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE frames are separated by a blank line.
        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? ''
        for (const frame of frames) {
          const chunk = frame
            .split('\n')
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).replace(/^ /, ''))
            .join('\n')
          if (chunk) setText((t) => t + chunk)
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setText((t) => t || '')
        throw err
      }
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const stop = useCallback(() => {
    controllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const reset = useCallback(() => setText(''), [])

  return { text, isStreaming, start, stop, reset }
}
