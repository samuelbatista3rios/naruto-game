import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import CHARACTERS, { BASIC_KUNAI, SUBSTITUTION } from '../data/characters'
import CharAvatar, { SkillIcon } from './CharAvatar'

const RANK_COLORS  = { S:'#ffaa00', A:'#ff5533', B:'#aa44ff', C:'#0088ff', D:'#22aa44' }
const SERIES_LABEL = { classic:'Clássico', shippuden:'Shippuden', akatsuki:'Akatsuki' }
const SERIES_ICONS = { classic:'🌀', shippuden:'⚡', akatsuki:'☁' }
const CHAKRA_COLORS = { nin:'#ff4400', tai:'#0088ff', gen:'#aa44ff', blood:'#cc0022', ran:'#888888' }

// Difficulty display
const DIFF_COLOR = {
  genin:'#22aa44', chunin:'#0088ff', jonin:'#aa44ff', anbu:'#cc2222', kage:'#ffcc00'
}
const DIFF_LABEL = {
  genin:'Genin', chunin:'Chunin', jonin:'Jonin', anbu:'Anbu', kage:'Kage'
}

function CostPips({ cost }) {
  const pips = []
  Object.entries(cost || {}).forEach(([t, n]) => {
    for (let i = 0; i < n; i++) pips.push(t)
  })
  if (!pips.length) return <span style={{ color: '#666', fontSize: '0.62rem' }}>Grátis</span>
  return (
    <div className="skill-cost">
      {pips.map((t, i) => (
        <div key={i} className="cost-pip" style={{ background: CHAKRA_COLORS[t] || '#888' }}>
          {t[0].toUpperCase()}
        </div>
      ))}
    </div>
  )
}

// Character detail modal
function CharModal({ char, isUnlocked, onClose }) {
  const allSkills = [...(char.skills || []), BASIC_KUNAI, SUBSTITUTION]
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="modal-char-header">
          <div className="modal-emoji">
            <CharAvatar char={char} size="lg" shape="circle"
              style={{ width: 70, height: 70, filter: !isUnlocked ? 'grayscale(1) brightness(0.4)' : 'none' }} />
          </div>
          <div>
            <div className="modal-char-name">{char.name}</div>
            <div className="modal-char-title">{char.title}</div>
            <div className="modal-meta">
              <span style={{ color: '#44cc77' }}>❤ {char.hp} HP</span>
              <span style={{ color: RANK_COLORS[char.rank] || '#888' }}>Rank {char.rank}</span>
              <span style={{ color: DIFF_COLOR[char.difficulty] || '#888', fontSize: '0.7rem' }}>
                {DIFF_LABEL[char.difficulty] || '?'}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {SERIES_ICONS[char.series]} {SERIES_LABEL[char.series] || char.series}
              </span>
            </div>
          </div>
        </div>

        {!isUnlocked && (
          <div style={{
            background: '#1a0a0a', border: '1px solid #cc4422', borderRadius: 8,
            padding: '10px 14px', marginBottom: 14, fontSize: '0.78rem',
            color: '#ff8866', textAlign: 'center',
          }}>
            🔒 Personagem bloqueado — complete missões para desbloquear!
          </div>
        )}

        {/* Description */}
        <div className="modal-desc">{char.desc}</div>
        {char.passiveDesc && (
          <div className="modal-passive">⭐ Passivo: {char.passiveDesc}</div>
        )}

        {/* Skills */}
        <div className="modal-skills-title">⚡ Habilidades</div>
        {allSkills.map((sk, i) => (
          <div key={sk.id || i} className="modal-skill">
            <div className="modal-skill-name">
              <SkillIcon skill={sk} size={20} />
              <span>{sk.name}</span>
              {sk.isBasic && (
                <span style={{ fontSize: '0.6rem', color: '#6688cc', background: '#0d0d2a', padding: '1px 5px', borderRadius: 3 }}>
                  Sempre disponível
                </span>
              )}
              {sk.isSubstitution && (
                <span style={{ fontSize: '0.6rem', color: '#44aa77', background: '#071a0f', padding: '1px 5px', borderRadius: 3 }}>
                  1× por batalha
                </span>
              )}
            </div>
            <div className="modal-skill-desc">{sk.desc}</div>
            <div className="modal-skill-stats">
              {sk.damage > 0 && <span style={{ color: '#ff6633' }}>⚔ {sk.damage} DMG</span>}
              {sk.heal > 0   && <span style={{ color: '#44cc77' }}>💚 +{sk.heal} HP</span>}
              {sk.effect && <span style={{ color: '#aaa', fontSize: '0.62rem' }}>{sk.effect}</span>}
              {sk.cooldown > 0 && sk.cooldown < 99 && (
                <span style={{ color: '#aaa' }}>⏳ CD: {sk.cooldown}t</span>
              )}
              <CostPips cost={sk.cost} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'all',       label: 'Todos'     },
  { key: 'classic',   label: '🌀 Clássico'  },
  { key: 'shippuden', label: '⚡ Shippuden' },
  { key: 'akatsuki',  label: '☁ Akatsuki'  },
  { key: 'unlocked',  label: '🔓 Desbloqueados' },
  { key: 'locked',    label: '🔒 Bloqueados'    },
]

export default function CharacterRoster() {
  const { player, dispatch } = useGame()
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null)

  const unlockedSet = new Set(player.unlockedChars || [])

  const visible = CHARACTERS.filter(c => {
    if (filter === 'all')       return true
    if (filter === 'unlocked')  return unlockedSet.has(c.id)
    if (filter === 'locked')    return !unlockedSet.has(c.id)
    return c.series === filter
  })

  const unlockedCount = CHARACTERS.filter(c => unlockedSet.has(c.id)).length
  const selectedChar  = selected ? CHARACTERS.find(c => c.id === selected) : null

  return (
    <div className="roster-screen">
      <div className="screen-header">
        <button className="back-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'menu' })}>
          ←
        </button>
        <h1>📖 Roster de Personagens</h1>
      </div>

      {/* Stats */}
      <div className="roster-stats">
        <span className="roster-stat-item">
          Desbloqueados: <strong style={{ color: '#44cc77' }}>{unlockedCount}</strong> / {CHARACTERS.length}
        </span>
        <span className="roster-stat-item">
          Bloqueados: <strong style={{ color: '#cc4422' }}>{CHARACTERS.length - unlockedCount}</strong>
        </span>
        {(() => {
          const series = { classic: 0, shippuden: 0, akatsuki: 0 }
          CHARACTERS.forEach(c => { if (series[c.series] !== undefined) series[c.series]++ })
          return (
            <>
              <span className="roster-stat-item">🌀 Clássico: <strong>{series.classic}</strong></span>
              <span className="roster-stat-item">⚡ Shippuden: <strong>{series.shippuden}</strong></span>
              <span className="roster-stat-item">☁ Akatsuki: <strong>{series.akatsuki}</strong></span>
            </>
          )
        })()}
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs" style={{ marginBottom: '14px' }}>
        {FILTERS.map(f => (
          <button key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 'auto', alignSelf: 'center' }}>
          {visible.length} mostrados
        </span>
      </div>

      {/* Grid */}
      <div className="roster-grid">
        {visible.map(char => {
          const isUnlocked = unlockedSet.has(char.id)
          return (
            <div key={char.id}
              className={`roster-card ${isUnlocked ? '' : 'locked'}`}
              onClick={() => setSelected(char.id)}>
              <div className="roster-avatar">
                <CharAvatar char={char} size="md" shape="square"
                  style={{ width: '100%', height: '74px', borderRadius: 0 }}
                  isDead={!isUnlocked} />
                {!isUnlocked && <span className="roster-lock">🔒</span>}
              </div>
              <div className="roster-info">
                <div className="roster-name">{char.name.split(' ')[0]}</div>
                <div className="roster-series">
                  {SERIES_ICONS[char.series]} {SERIES_LABEL[char.series] || char.series}
                </div>
                <div className="roster-rank" style={{ color: RANK_COLORS[char.rank] || '#888' }}>
                  {char.rank}-Rank
                </div>
                {!isUnlocked && (
                  <span className="locked-badge">🔒 Bloqueado</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedChar && (
        <CharModal
          char={selectedChar}
          isUnlocked={unlockedSet.has(selectedChar.id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
