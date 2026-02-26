import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import CHARACTERS, { BASIC_KUNAI, SUBSTITUTION } from '../data/characters'
import CharAvatar, { SkillIcon } from './CharAvatar'

const CHAKRA_COLORS = { nin:'#ff4400', tai:'#0088ff', gen:'#aa44ff', blood:'#cc0022', ran:'#888888' }
const SERIES_LABEL = { classic:'Clássico', shippuden:'Shippuden', akatsuki:'Akatsuki' }
const RANK_COLORS  = { S:'#ffaa00', A:'#ff5533', B:'#aa44ff', C:'#0088ff', D:'#22aa44' }

// Mini chakra cost pills
function CostPips({ cost }) {
  const pips = []
  Object.entries(cost || {}).forEach(([type, count]) => {
    for (let i = 0; i < count; i++) pips.push(type)
  })
  if (!pips.length) return <span style={{ fontSize: '0.65rem', color: '#888' }}>Grátis</span>
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

// Detail panel for a selected character
function CharDetail({ char }) {
  if (!char) {
    return (
      <div className="char-detail-panel">
        <div className="detail-card" style={{ textAlign: 'center', padding: '30px 14px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👆</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Clique em um personagem para ver os detalhes
          </div>
        </div>
      </div>
    )
  }

  const allSkills = [...char.skills, BASIC_KUNAI, SUBSTITUTION]

  return (
    <div className="char-detail-panel">
      <div className="detail-card">
        <div className="detail-avatar">
          <CharAvatar char={char} size="lg" shape="circle" />
        </div>
        <div className="detail-char-name">{char.name}</div>
        <div className="detail-char-title">{char.title}</div>
        <div className="detail-meta">
          <span className="detail-hp">❤️ {char.hp} HP</span>
          <span style={{ color: RANK_COLORS[char.rank] || '#888' }}>Rank {char.rank}</span>
          <span>{SERIES_LABEL[char.series] || char.series}</span>
        </div>
        <div className="detail-desc">{char.desc}</div>
        {char.passiveDesc && (
          <div className="detail-passive">⭐ Passivo: {char.passiveDesc}</div>
        )}

        <div className="detail-skills-title">Habilidades</div>

        {allSkills.map((sk, i) => (
          <div key={sk.id || i} className="detail-skill-item">
            <div className="detail-skill-name">
              <SkillIcon skill={sk} size={18} />
              <span>{sk.name}</span>
              {sk.isBasic && (
                <span style={{ fontSize: '0.6rem', color: '#6688cc', background: '#0d0d2a', padding: '1px 4px', borderRadius: 3 }}>
                  Sempre
                </span>
              )}
              {sk.isSubstitution && (
                <span style={{ fontSize: '0.6rem', color: '#44aa77', background: '#071a0f', padding: '1px 4px', borderRadius: 3 }}>
                  1×
                </span>
              )}
            </div>
            <div className="detail-skill-desc">{sk.desc}</div>
            <div className="detail-skill-stats">
              {sk.damage > 0 && <span style={{ color: '#ff6633' }}>⚔ {sk.damage} DMG</span>}
              {sk.heal   > 0 && <span style={{ color: '#44cc77' }}>💚 +{sk.heal} HP</span>}
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

// Series filter tabs
const FILTERS = [
  { key: 'all',       label: 'Todos'     },
  { key: 'classic',   label: '🌀 Clássico'  },
  { key: 'shippuden', label: '⚡ Shippuden' },
  { key: 'akatsuki',  label: '☁ Akatsuki'  },
]

export default function CharacterSelect() {
  const { player, selectedTeam, dispatch } = useGame()
  const [filter, setFilter]       = useState('all')
  const [detailChar, setDetailChar] = useState(null)

  const unlockedSet = new Set(player.unlockedChars || [])

  // Filter characters
  const visible = CHARACTERS.filter(c => filter === 'all' || c.series === filter)

  function handleCharClick(char) {
    setDetailChar(char)
    if (!unlockedSet.has(char.id)) return
    dispatch({ type: 'TOGGLE_CHAR', id: char.id })
  }

  function removeFromTeam(id) {
    dispatch({ type: 'REMOVE_FROM_TEAM', id })
  }

  function startBattle() {
    if (selectedTeam.length !== 3) return
    dispatch({ type: 'START_BATTLE' })
  }

  // Fill team slots display
  const slots = [0, 1, 2].map(i => {
    const id   = selectedTeam[i]
    const char = id ? CHARACTERS.find(c => c.id === id) : null
    return { id, char }
  })

  return (
    <div className="char-select-screen">
      {/* Header */}
      <div className="char-select-header">
        <button className="btn btn-ghost btn-sm"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'menu' })}>
          ← Voltar
        </button>
        <h2>⚔ Selecionar Time</h2>

        {/* Team slots */}
        <div className="team-slots">
          {slots.map((slot, i) => (
            <div key={i}
              className={`team-slot ${slot.char ? 'filled' : ''}`}
              style={slot.char ? {
                background: `linear-gradient(135deg, ${slot.char.color}22, ${slot.char.colorDark}44)`,
                borderColor: slot.char.color,
              } : {}}>
              {slot.char ? (
                <>
                  <CharAvatar char={slot.char} size="sm" shape="circle" style={{ width: 38, height: 38 }} />
                  <span className="slot-name">{slot.char.name.split(' ')[0]}</span>
                  <span className="slot-remove" onClick={() => removeFromTeam(slot.id)}>✕</span>
                </>
              ) : (
                <span style={{ fontSize: '1.2rem', opacity: 0.4 }}>?</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="char-select-body">
        {/* Grid panel */}
        <div className="char-grid-panel">
          {/* Filters */}
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button key={f.key}
                className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: 'auto', alignSelf: 'center' }}>
              {visible.length} personagens
            </span>
          </div>

          {/* Character grid */}
          <div className="char-grid">
            {visible.map(char => {
              const isUnlocked = unlockedSet.has(char.id)
              const isSelected = selectedTeam.includes(char.id)
              return (
                <div key={char.id}
                  className={`char-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`}
                  style={{
                    '--card-color': char.color,
                    background: isSelected
                      ? `linear-gradient(135deg, ${char.color}33, ${char.colorDark}55)`
                      : `linear-gradient(135deg, ${char.color}0f, var(--bg-card))`,
                  }}
                  onClick={() => handleCharClick(char)}>

                  {!isUnlocked && <span className="lock-icon">🔒</span>}

                  <div className="char-avatar">
                    <CharAvatar char={char} size="md" shape="square" />
                  </div>
                  <div className="char-name">{char.name.split(' ')[0]}</div>
                  <div className="char-hp-mini">❤ {char.hp}</div>

                  {/* Color bar underline */}
                  <div style={{ width: '100%', height: '2px', background: `${char.color}88` }} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <CharDetail char={detailChar} />
      </div>

      {/* Footer */}
      <div className="select-footer">
        <div className="team-count" style={{ color: selectedTeam.length === 3 ? '#44cc77' : 'var(--text-secondary)' }}>
          {selectedTeam.length === 3
            ? '✅ Time completo — pronto para lutar!'
            : `Selecione ${3 - selectedTeam.length} personagem${3 - selectedTeam.length !== 1 ? 's' : ''} para o time`}
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={startBattle}
          disabled={selectedTeam.length !== 3}>
          ⚔ Batalhar!
        </button>
      </div>
    </div>
  )
}
