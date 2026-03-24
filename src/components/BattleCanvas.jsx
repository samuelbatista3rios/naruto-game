import { useEffect, useRef } from 'react'

const CHAKRA_COLORS = [
  '#ff4400', // nin
  '#0088ff', // tai
  '#aa44ff', // gen
  '#cc0022', // blood
  '#ffaa00', // accent
  '#44ffaa', // regen
]

export default function BattleCanvas({ phase }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ particles: [], raf: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const S = stateRef.current

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function mkParticle(spread = false) {
      const w = canvas.width || 800
      const h = canvas.height || 400
      return {
        x:       Math.random() * w,
        y:       spread ? Math.random() * h : h + 10,
        vx:      (Math.random() - 0.5) * 0.6,
        vy:      -(Math.random() * 0.7 + 0.25),
        r:       Math.random() * 2.2 + 0.5,
        color:   CHAKRA_COLORS[Math.floor(Math.random() * CHAKRA_COLORS.length)],
        alpha:   Math.random() * 0.55 + 0.15,
        life:    0,
        maxLife: Math.random() * 220 + 80,
        wobble:  Math.random() * Math.PI * 2,
        wobbleS: (Math.random() - 0.5) * 0.04,
      }
    }

    // seed initial particles spread across the canvas
    for (let i = 0; i < 50; i++) {
      const p = mkParticle(true)
      p.life = Math.random() * p.maxLife
      S.particles.push(p)
    }

    function draw() {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Dark vignette gradient overlay
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, h * 0.9)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(0,0,0,0.45)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

      // Subtle ground line at 65% height
      const groundY = h * 0.65
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      ctx.lineTo(w, groundY)
      ctx.strokeStyle = 'rgba(255,140,0,0.06)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Ground glow
      const glow = ctx.createLinearGradient(0, groundY - 6, 0, groundY + 20)
      glow.addColorStop(0, 'rgba(255,100,0,0.07)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, groundY - 6, w, 26)

      // Particles
      for (let i = S.particles.length - 1; i >= 0; i--) {
        const p = S.particles[i]
        p.wobble += p.wobbleS
        p.x += p.vx + Math.sin(p.wobble) * 0.15
        p.y += p.vy
        p.life++

        const ratio = p.life / p.maxLife
        const a     = p.alpha * (1 - ratio * ratio)

        // Glow radial gradient
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3)
        const hex = p.color
        gr.addColorStop(0, hex + Math.round(a * 255).toString(16).padStart(2, '0'))
        gr.addColorStop(1, hex + '00')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.fill()

        // Solid core
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 0.6, 0, Math.PI * 2)
        ctx.fillStyle = hex + Math.round(Math.min(a * 1.5, 1) * 255).toString(16).padStart(2, '0')
        ctx.fill()

        if (p.life >= p.maxLife || p.y < -10) {
          S.particles[i] = mkParticle()
        }
      }

      // Occasionally spawn extra
      if (S.particles.length < 60 && Math.random() < 0.25) {
        S.particles.push(mkParticle())
      }

      S.raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(S.raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
