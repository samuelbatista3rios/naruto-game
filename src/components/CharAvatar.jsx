import React, { useState } from 'react'
import CHARACTER_IMAGES from '../data/characterImages'

/**
 * CharAvatar — Exibe a imagem real do personagem com fallback para emoji.
 *
 * Props:
 *   char       — objeto do personagem (id, emoji, color, colorDark, name)
 *   size       — 'sm' | 'md' | 'lg' | 'xl'   (default 'md')
 *   shape      — 'square' | 'circle'          (default 'square')
 *   className  — classes extras
 *   style      — estilos extras no wrapper
 *   isDead     — boolean: aplica filtro cinza + ícone 💀
 */
export default function CharAvatar({ char, size = 'md', shape = 'square', className = '', style = {}, isDead = false }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgUrl = CHARACTER_IMAGES[char.id]
  const showImage = !!imgUrl && !imgFailed

  // Tamanhos
  const sizeMap = { sm: 36, md: 52, lg: 70, xl: 96 }
  const px = sizeMap[size] || 52

  const wrapStyle = {
    width: px, height: px,
    borderRadius: shape === 'circle' ? '50%' : '10px',
    overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    background: `linear-gradient(135deg, ${char.color}55, ${char.colorDark || '#111'}99)`,
    filter: isDead ? 'grayscale(1) brightness(0.4)' : 'none',
    transition: 'filter 0.2s',
    ...style,
  }

  return (
    <div className={`char-avatar-wrap ${className}`} style={wrapStyle}>
      {showImage ? (
        <img
          src={imgUrl}
          alt={char.name}
          onError={() => setImgFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top center',
            display: 'block',
          }}
        />
      ) : (
        <span style={{
          fontSize: px * 0.5,
          lineHeight: 1,
          userSelect: 'none',
        }}>
          {isDead ? '💀' : char.emoji}
        </span>
      )}

      {/* Overlay gradiente sutil para melhorar legibilidade */}
      {showImage && !isDead && (
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '35%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}

/**
 * SkillIcon — Ícone para habilidades (usa imagem do wiki ou emoji fallback)
 */
import { SKILL_IMAGES } from '../data/characterImages'

export function SkillIcon({ skill, size = 24 }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgUrl = SKILL_IMAGES[skill.id]
  const showImage = !!imgUrl && !imgFailed

  if (showImage) {
    return (
      <img
        src={imgUrl}
        alt={skill.name}
        onError={() => setImgFailed(true)}
        style={{
          width: size, height: size,
          objectFit: 'cover',
          borderRadius: 4,
          flexShrink: 0,
        }}
      />
    )
  }
  return (
    <span style={{ fontSize: size * 0.75, lineHeight: 1, flexShrink: 0 }}>
      {skill.element || '⚡'}
    </span>
  )
}
