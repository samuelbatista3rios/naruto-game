import React from 'react'
import { useGame } from '../context/GameContext'
import MISSIONS from '../data/missions'
import CHARACTERS from '../data/characters'

// Get mission progress for a given mission
function getMissionProgress(mission, player) {
  const p = player.missionProgress || {}
  switch (mission.type) {
    case 'win_battles':          return { current: p.win_battles || 0,           target: mission.target }
    case 'use_skill':            return { current: p.use_skill   || 0,           target: mission.target }
    case 'deal_damage':          return { current: Math.floor(p.deal_damage || 0), target: mission.target }
    case 'win_with_char':        return { current: p[`win_with_char_${mission.charId}`] || 0, target: mission.target }
    case 'deal_damage_with_char':return { current: Math.floor(p[`deal_damage_with_char_${mission.charId}`] || 0), target: mission.target }
    case 'perfect_win':          return { current: p.perfect_win || 0,           target: mission.target }
    case 'win_streak':           return { current: p.win_streak  || 0,           target: mission.target }
    case 'rank_points':          return { current: player.rankPoints || 0,       target: mission.target }
    case 'use_skill_id':         return { current: p[`use_skill_id_${mission.skillId}`] || 0, target: mission.target }
    case 'heal_with_char':       return { current: p[`heal_with_char_${mission.charId}`] || 0, target: mission.target }
    case 'win_with_series':      return { current: p.win_with_series_shippuden || 0, target: mission.target }
    default:                     return { current: 0, target: mission.target }
  }
}

const DIFF_CLASS = { 'D-Rank': 'D', 'C-Rank': 'C', 'B-Rank': 'B', 'A-Rank': 'A', 'S-Rank': 'S' }
const CATEGORY_ICONS = {
  'Genin': '🌱', 'Exame Chunin': '📝', 'Missões Jonin': '⚔',
  'Operações ANBU': '🗡', 'Missões de Kage': '👑', 'Missões Secretas': '🔐',
}

function MissionCard({ mission, player, onClaim }) {
  const isCompleted = player.completedMissions?.includes(mission.id)
  const progress    = getMissionProgress(mission, player)
  const pct         = Math.min(1, progress.target > 0 ? progress.current / progress.target : 0)
  const isReady     = !isCompleted && pct >= 1
  const diffKey     = DIFF_CLASS[mission.difficulty] || 'D'

  const unlockChar  = mission.unlockChar
    ? CHARACTERS.find(c => c.id === mission.unlockChar)
    : null

  return (
    <div className={`mission-card ${isCompleted ? 'completed' : isReady ? 'claimable' : ''}`}>
      <div className="mission-info">
        <span className={`diff-badge diff-${diffKey}`}>{mission.difficulty}</span>
        <div className="mission-name">
          {isCompleted && '✅ '}{mission.name}
        </div>
        <div className="mission-desc">{mission.desc}</div>
        {!isCompleted && (
          <>
            <div className="mission-prog-bar">
              <div className="mission-prog-fill"
                style={{
                  width: `${Math.round(pct * 100)}%`,
                  background: isReady
                    ? 'linear-gradient(90deg, #22aa44, #44cc66)'
                    : 'linear-gradient(90deg, var(--accent), #cc5500)',
                }} />
            </div>
            <div className="mission-prog-text">
              {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
              {isReady && <span style={{ color: '#44cc66', marginLeft: 6 }}>✔ Completo!</span>}
            </div>
          </>
        )}
      </div>

      <div className="mission-side">
        {mission.rewards.ryo > 0 && (
          <div className="mission-ryo">💰 {mission.rewards.ryo} Ryō</div>
        )}
        {mission.rewards.rankPoints > 0 && (
          <div className="mission-pts">+{mission.rewards.rankPoints} pts</div>
        )}
        {unlockChar && (
          <div className="mission-unlock">
            🔓 {unlockChar.emoji} {unlockChar.name.split(' ')[0]}
          </div>
        )}

        {isCompleted ? (
          <span style={{ fontSize: '1.2rem' }}>✅</span>
        ) : isReady ? (
          <button className="btn btn-success btn-sm" onClick={() => onClaim(mission.id)}>
            🏅 Resgatar
          </button>
        ) : (
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            {Math.round(pct * 100)}%
          </span>
        )}
      </div>
    </div>
  )
}

export default function MissionBoard() {
  const { player, dispatch } = useGame()

  function handleClaim(missionId) {
    dispatch({ type: 'CLAIM_MISSION', missionId })
  }

  // Group missions by category
  const categories = [...new Set(MISSIONS.map(m => m.category))]
  const readyCount = MISSIONS.filter(m =>
    !player.completedMissions?.includes(m.id) &&
    getMissionProgress(m, player).current >= m.target
  ).length

  return (
    <div className="mission-board">
      <div className="screen-header">
        <button className="back-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'menu' })}>
          ←
        </button>
        <h1>📜 Missões</h1>
        {readyCount > 0 && (
          <span style={{
            background: '#cc4400', color: '#fff', borderRadius: '50%',
            width: '22px', height: '22px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700,
          }}>
            {readyCount}
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '18px', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Concluídas:{' '}
          <strong style={{ color: '#44cc77' }}>{player.completedMissions?.length || 0}</strong>
          {' / '}{MISSIONS.length}
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Vitórias: <strong style={{ color: 'var(--accent)' }}>{player.wins || 0}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Dano: <strong style={{ color: '#ff7744' }}>{(player.totalDamage || 0).toLocaleString()}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Ryō: <strong style={{ color: '#ffcc00' }}>{(player.ryo || 0).toLocaleString()}</strong>
        </span>
      </div>

      {/* Categories */}
      {categories.map(cat => {
        const catMissions = MISSIONS.filter(m => m.category === cat)
        const catCompleted = catMissions.filter(m => player.completedMissions?.includes(m.id)).length
        const icon = CATEGORY_ICONS[cat] || '📋'
        return (
          <div key={cat} className="mission-section">
            <div className="mission-section-title">
              <span>{icon} {cat}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {catCompleted}/{catMissions.length}
              </span>
            </div>
            <div className="mission-cards">
              {catMissions.map(m => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  player={player}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
