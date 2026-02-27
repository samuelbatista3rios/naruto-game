import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { RANK_INFO, getRankByPoints } from '../data/missions'
import CHARACTERS from '../data/characters'
import CharAvatar from './CharAvatar'

// Cores por rank
const RANK_COLORS = {
  Genin: '#22aa44', Chunin: '#0088ff',
  Jonin: '#aa44ff', Anbu:   '#cc2222', Kage: '#ffcc00',
}

// Barra de progresso para o próximo rank
function RankProgress({ rankPoints }) {
  const current = getRankByPoints(rankPoints)
  const nextRank = RANK_INFO.find(r => r.minPoints > rankPoints)
  if (!nextRank) {
    return (
      <div className="rank-progress">
        <div className="rank-progress-labels">
          <span>Kage 👑</span>
          <span style={{ color: RANK_COLORS.Kage }}>Rank Máximo!</span>
        </div>
        <div className="rank-progress-track">
          <div className="rank-progress-fill" style={{ width: '100%', background: RANK_COLORS.Kage }} />
        </div>
      </div>
    )
  }
  const prevPts  = current.minPoints
  const needed   = nextRank.minPoints - prevPts
  const progress = Math.max(0, Math.min(1, (rankPoints - prevPts) / needed))
  const color    = RANK_COLORS[nextRank.rank] || '#888'
  return (
    <div className="rank-progress">
      <div className="rank-progress-labels">
        <span>{current.rank}</span>
        <span style={{ color }}>
          {rankPoints - prevPts} / {needed} pts → {nextRank.rank}
        </span>
      </div>
      <div className="rank-progress-track">
        <div className="rank-progress-fill"
          style={{ width: `${Math.round(progress * 100)}%`, background: color }} />
      </div>
    </div>
  )
}

const SECRET_CODE = 'DATTEBAYO'

export default function MainMenu() {
  const { player, rankName, selectedTeam, dispatch } = useGame()
  const rankInfo = getRankByPoints(player.rankPoints || 0)
  const rankColor = RANK_COLORS[rankName] || '#888'

  const [codeInput, setCodeInput] = useState('')
  const [codeMsg, setCodeMsg] = useState(null)
  const [showCodeInput, setShowCodeInput] = useState(false)

  const winRate = player.totalBattles > 0
    ? Math.round((player.wins / player.totalBattles) * 100)
    : 0

  // Mini preview do time selecionado
  const teamChars = (selectedTeam || [])
    .map(id => CHARACTERS.find(c => c.id === id))
    .filter(Boolean)

  const handleCodeSubmit = (e) => {
    e.preventDefault()
    const code = codeInput.trim().toUpperCase()
    if (code === SECRET_CODE) {
      dispatch({ type: 'UNLOCK_ALL_CHARS' })
      setCodeMsg({ ok: true, text: '✅ Todos os personagens desbloqueados!' })
      setShowCodeInput(false)
    } else {
      setCodeMsg({ ok: false, text: '❌ Código inválido!' })
    }
    setCodeInput('')
    setTimeout(() => setCodeMsg(null), 3000)
  }

  return (
    <div className="main-menu">
      {/* Logo */}
      <div className="menu-logo">
        <div className="menu-logo-title">⚔ NARUTO ARENA</div>
        <div className="menu-logo-sub">Ninja Battle Simulator — v3.0</div>
      </div>

      {/* Player card */}
      <div className="player-card">
        <div className="player-rank-badge"
          style={{ background: `${rankColor}22`, color: rankColor, border: `1px solid ${rankColor}55` }}>
          🎌 {rankName}
        </div>
        <div className="player-name">{player.name || 'Shinobi'}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          {rankInfo.desc}
        </div>
        <div className="player-stats">
          <div className="player-stat">
            <span className="player-stat-value">{player.wins || 0}</span>
            <span className="player-stat-label">Vitórias</span>
          </div>
          <div className="player-stat">
            <span className="player-stat-value">{player.losses || 0}</span>
            <span className="player-stat-label">Derrotas</span>
          </div>
          <div className="player-stat">
            <span className="player-stat-value" style={{ color: '#ffcc00' }}>
              🔥 {player.streak || 0}
            </span>
            <span className="player-stat-label">Sequência</span>
          </div>
          <div className="player-stat">
            <span className="player-stat-value" style={{ color: '#ffcc00' }}>
              💰 {(player.ryo || 0).toLocaleString()}
            </span>
            <span className="player-stat-label">Ryō</span>
          </div>
          <div className="player-stat">
            <span className="player-stat-value" style={{ color: '#ff7744' }}>
              {winRate}%
            </span>
            <span className="player-stat-label">Win Rate</span>
          </div>
          <div className="player-stat">
            <span className="player-stat-value" style={{ color: '#ff7744' }}>
              {(player.totalDamage || 0).toLocaleString()}
            </span>
            <span className="player-stat-label">Dano Total</span>
          </div>
        </div>
        <RankProgress rankPoints={player.rankPoints || 0} />
      </div>

      {/* Team preview */}
      {teamChars.length > 0 && (
        <div className="team-preview">
          <div className="team-preview-title">🟢 Time Atual</div>
          <div className="team-preview-chars">
            {teamChars.map(c => (
              <div key={c.id} className="preview-char"
                style={{ borderColor: `${c.color}55`, background: `${c.color}11` }}>
                <CharAvatar char={c} size="sm" shape="circle" style={{ width: 40, height: 40 }} />
                <div className="preview-name">{c.name.split(' ')[0]}</div>
              </div>
            ))}
            {teamChars.length < 3 && Array.from({ length: 3 - teamChars.length }, (_, i) => (
              <div key={`empty-${i}`} className="preview-char"
                style={{ opacity: 0.35, borderStyle: 'dashed' }}>
                <div style={{ fontSize: '1.2rem' }}>❓</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="menu-nav">
        <button
          className="menu-nav-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'select' })}
        >
          <span className="nav-icon">⚔️</span>
          <div className="nav-texts">
            <span>Batalhar</span>
            <span className="nav-desc">Selecione seu time e lute!</span>
          </div>
          <span className="nav-arrow">›</span>
        </button>

        <button
          className="menu-nav-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'missions' })}
        >
          <span className="nav-icon">📜</span>
          <div className="nav-texts">
            <span>Missões</span>
            <span className="nav-desc">
              {player.completedMissions?.length || 0} missões concluídas
            </span>
          </div>
          <span className="nav-arrow">›</span>
        </button>

        <button
          className="menu-nav-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'roster' })}
        >
          <span className="nav-icon">📖</span>
          <div className="nav-texts">
            <span>Roster</span>
            <span className="nav-desc">
              {player.unlockedChars?.length || 0} / {CHARACTERS.length} personagens desbloqueados
            </span>
          </div>
          <span className="nav-arrow">›</span>
        </button>
      </div>

      {/* Version footer */}
      <div style={{ marginTop: '24px', fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        {player.unlockedChars?.length || 0} / {CHARACTERS.length} personagens •{' '}
        {player.completedMissions?.length || 0} missões • Rank {rankName}
      </div>

      {/* Unlock code section */}
      <div className="unlock-code-section">
        {!showCodeInput ? (
          <button
            className="unlock-code-toggle"
            onClick={() => setShowCodeInput(true)}
            title="Inserir código secreto"
          >
            🔐 Código Secreto
          </button>
        ) : (
          <form className="unlock-code-form" onSubmit={handleCodeSubmit}>
            <input
              className="unlock-code-input"
              type="text"
              placeholder="Digite o código..."
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              autoFocus
              maxLength={32}
            />
            <button type="submit" className="unlock-code-btn">🔓</button>
            <button
              type="button"
              className="unlock-code-cancel"
              onClick={() => { setShowCodeInput(false); setCodeInput('') }}
            >✕</button>
          </form>
        )}
        {codeMsg && (
          <div className={`unlock-code-msg ${codeMsg.ok ? 'ok' : 'err'}`}>
            {codeMsg.text}
          </div>
        )}
      </div>
    </div>
  )
}
