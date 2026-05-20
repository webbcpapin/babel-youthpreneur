import { useRef, useEffect } from 'react'

interface WaveTextProps {
  direction?: 'ltr' | 'rtl'
  text?: string
}

export default function WaveText({
  direction = 'ltr',
  text = 'BABEL YOUTHPRENEUR \u2022 MEMBANGUN EKOSISTEM ENTREPRENEUR MUDA \u2022 PENGGERAK EKONOMI DAERAH \u2022 ',
}: WaveTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const scrollRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = 1.5
    let width = 0
    let height = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      width = parent.offsetWidth
      height = parent.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const textSize = 22
    const amplitude = 0.4
    const waveNumber = 2
    const waveSpeed = direction === 'ltr' ? 0.002 : -0.002
    const scrollSpeed = 0.8

    // Create repeated text
    const repeatedText = text.repeat(20)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.font = `600 ${textSize}px "Plus Jakarta Sans", sans-serif`
      ctx.fillStyle = 'rgba(201, 168, 124, 0.25)'
      ctx.textBaseline = 'middle'

      const time = performance.now() * 0.001
      scrollRef.current += scrollSpeed

      const textWidth = ctx.measureText(repeatedText).width
      const offset = -(scrollRef.current % textWidth)

      const centerY = height / 2

      for (let x = 0; x < width + textWidth; x += 1) {
        const waveX = (x + offset) / width
        const sineWave = Math.sin(waveX * Math.PI * 2 * waveNumber + time * waveSpeed * 1000)
        const y = centerY + sineWave * height * amplitude

        if (x % 8 === 0) {
          const charIndex = Math.floor(((x + offset) / textWidth) * repeatedText.length) % repeatedText.length
          const char = repeatedText[charIndex] || ' '
          ctx.fillText(char, x, y)
        }
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    // Throttle to ~30fps for performance
    let lastTime = 0
    const fps = 30
    const interval = 1000 / fps

    const throttledDraw = (timestamp: number) => {
      frameRef.current = requestAnimationFrame(throttledDraw)
      if (timestamp - lastTime < interval) return
      lastTime = timestamp
      draw()
    }
    frameRef.current = requestAnimationFrame(throttledDraw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [direction, text])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
