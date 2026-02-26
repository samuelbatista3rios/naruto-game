import React, { useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { BASIC_KUNAI, SUBSTITUTION } from '../data/characters'
import CharAvatar, { SkillIcon } from './CharAvatar'

// ─────────────────────────────────────────────────────────────
//  Chakra type metadata
// ─────────────────────────────────────────────────────────────
const CHAKRA_META = [
  { key: 'nin',   label: 'Nin',  color: '#ff4400' },
  { key: 'tai',   label: 'Tai',  color: '#0088ff' },
  { key: 'gen',   label: 'Gen',  color: '#aa44ff' },
  { key: 'blood', label: 'Kek',  color: '#cc0022' },
  { key: 'ran',   label: 'Ran',  color: '#888888' },
]

// Can the player afford this skill?
function canAfford(skill, chakra) {
  if (skill.isBasic || skill.isSubstitution) return true
  return Object.entries(skill.cost || {}).every(([t, n]) => (chakra[t] || 0) >= n)
}

// HP percentage color
function hpClass(current, max) {
  const p = current / max
  if (p > 0.5) return ''
  if (p > 0.25) return 'medium'
  return 'low'
}

// ─────────────────────────────────────────────────────────────
//  ChakraDisplay
// ─────────────────────────────────────────────────────────────
function ChakraDisplay({ chakra }) {
  return (
    <div className="chakra-display">
      {CHAKRA_META.map(t => {
        const count = chakra[t.key] || 0
        return (
          <div key={t.key} className="chakra-type">
            <div className="chakra-label" style={{ color: t.color }}>{t.label}</div>
            <div className="chakra-orbs">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="chakra-orb"
                  style={{ background: i < count ? t.color : '#1e1e2e', opacity: i < count ? 1 : 0.3 }} />
              ))}
            </div>
            <div className="chakra-count" style={{ color: count > 0 ? t.color : '#444' }}>{count}</div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  StatusBadges
// ─────────────────────────────────────────────────────────────
const STATUS_CSS = {
  stun: 's-stun', burn: 's-burn', bleed: 's-bleed', shield: 's-shield',
  invul: 's-invul', regen: 's-regen', boost: 's-boost', debuff: 's-debuff',
  revive: 's-revive', jashin: 's-jashin', gates_backlash: 's-burn',
}
const STATUS_ICONS = {
  stun: '💫', burn: '🔥', bleed: '🩸', shield: '🛡', invul: '💨', regen: '💚',
  boost: '⬆', debuff: '⬇', revive: '☯', jashin: '☠', gates_backlash: '⚡',
}
function StatusBadges({ statuses }) {
  if (!statuses?.length) return null
  return (
    <div className="fighter-statuses">
      {statuses.slice(0, 4).map((s, i) => (
        <span key={i} className={`status-badge ${STATUS_CSS[s.type] || 's-other'}`}>
          {STATUS_ICONS[s.type] || '?'} {s.duration < 99 ? s.duration : ''}
        </span>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  SkillCostPips
// ─────────────────────────────────────────────────────────────
function CostPips({ cost }) {
  const pips = []
  const colors = { nin: '#ff4400', tai: '#0088ff', gen: '#aa44ff', blood: '#cc0022', ran: '#888888' }
  Object.entries(cost || {}).forEach(([t, n]) => {
    for (let i = 0; i < n; i++) pips.push(t)
  })
  if (!pips.length) return <span style={{ fontSize: '0.62rem', color: '#666' }}>Grátis</span>
  return (
    <div className="skill-cost">
      {pips.map((t, i) => (
        <div key={i} className="cost-pip" style={{ background: colors[t] || '#888' }}>
          {t[0].toUpperCase()}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  FighterCard
// ─────────────────────────────────────────────────────────────
function FighterCard({ fighter, isActive, isTarget, isAllyTarget, isDead, isIdle, onClick }) {
  const pct    = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100)
  const barCls = hpClass(fighter.currentHp, fighter.maxHp)

  let cls = 'fighter-card'
  if (isDead) cls += ' dead'
  else if (isActive)    cls += ' active-f'
  else if (isTarget)    cls += ' target-f'
  else if (isAllyTarget) cls += ' ally-f'
  else if (isIdle)      cls += ' idle'

  return (
    <div className={cls}
      style={{
        background: isDead
          ? '#0a0a0a'
          : `linear-gradient(160deg, ${fighter.color}18 0%, #0d1117 60%)`,
        borderColor: isActive ? fighter.color : undefined,
      }}
      onClick={!isDead ? onClick : undefined}>

      {/* Avatar */}
      <div className="fighter-emoji">
        <CharAvatar char={fighter} size="md" shape="circle" isDead={isDead} />
      </div>

      {/* Name */}
      <div className="fighter-name" style={{ color: isDead ? '#444' : undefined }}>
        {fighter.name.split(' ')[0]}
      </div>

      {/* HP */}
      {!isDead && (
        <>
          <div className="fighter-hp-row">{fighter.currentHp}/{fighter.maxHp}</div>
          <div className="hp-bar-wrap" style={{ width: '90%' }}>
            <div className={`hp-bar ${barCls}`} style={{ width: `${pct}%` }} />
          </div>
        </>
      )}

      {/* Statuses */}
      <StatusBadges statuses={fighter.statuses} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  SkillButton
// ─────────────────────────────────────────────────────────────
function SkillButton({ skill, fighter, chakra, onClick }) {
  const affordable = canAfford(skill, chakra)
  const onCooldown = !skill.isBasic && !skill.isSubstitution && (fighter.cooldowns?.[skill.id] > 0)
  const substUsed  = skill.isSubstitution && fighter.substUsed
  const disabled   = !affordable || onCooldown || substUsed

  let extraCls = ''
  if (skill.isBasic)        extraCls = ' basic'
  if (skill.isSubstitution) extraCls = ` subst${substUsed ? ' used' : ''}`

  return (
    <button className={`skill-btn${extraCls}`} disabled={disabled} onClick={() => !disabled && onClick(skill)}>
      <div className="skill-btn-header">
        <SkillIcon skill={skill} size={20} />
        <span className="skill-btn-name">{skill.name}</span>
        {onCooldown && (
          <span className="skill-cd-badge">⏳{fighter.cooldowns[skill.id]}t</span>
        )}
        {substUsed && (
          <span className="skill-cd-badge" style={{ color: '#888' }}>Usada</span>
        )}
      </div>
      <div className="skill-btn-desc">{skill.desc}</div>
      <div className="skill-btn-meta">
        {skill.damage > 0 && <span className="skill-dmg">⚔ {skill.damage}</span>}
        {skill.heal   > 0 && <span className="skill-heal">💚 +{skill.heal}</span>}
        <CostPips cost={skill.cost} />
        {!affordable && !onCooldown && !substUsed && (
          <span style={{ fontSize: '0.62rem', color: '#cc4422' }}>Chakra insuf.</span>
        )}
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
//  BattleResult overlay
// ─────────────────────────────────────────────────────────────
function BattleResult({ battle, onClaim }) {
  if (!battle || battle.phase !== 'end') return null
  const win = battle.winner === 'player'
  return (
    <div className="result-overlay">
      <div className="result-card">
        <div className={`result-title ${win ? 'win' : 'lose'}`}>
          {win ? '🏆 VITÓRIA!' : '💀 DERROTA'}
        </div>
        <div className="result-vs">vs. {battle.enemyTeamName}</div>
        <div className="result-stats">
          <div className="result-stat">
            <span className="result-stat-val">{battle.turn}</span>
            <span className="result-stat-lbl">Turnos</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-val">{battle.damageDealt || 0}</span>
            <span className="result-stat-lbl">Dano Total</span>
          </div>
          {win && (
            <div className="result-stat">
              <span className="result-stat-val" style={{ color: '#ffcc00' }}>
                +{100 + Math.floor(Math.random() * 100)}
              </span>
              <span className="result-stat-lbl">Ryō</span>
            </div>
          )}
        </div>
        <button className={`btn btn-lg ${win ? 'btn-success' : 'btn-danger'}`}
          onClick={onClaim}>
          {win ? '🏅 Reivindicar Recompensas' : '↩ Voltar ao Menu'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BattleScreen — main component
// ─────────────────────────────────────────────────────────────
export default function BattleScreen() {
  const { battle, dispatch } = useGame()
  const logRef = useRef(null)

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [battle?.log])

  if (!battle) return null

  const {
    playerTeam, enemyTeam, chakra, turn, phase, winner,
    selectedCharIdx, targetMode, targetType, log, enemyTeamName,
  } = battle

  const selectedFighter = selectedCharIdx !== null ? playerTeam[selectedCharIdx] : null
  const isPlayerTurn    = phase === 'player'
  const isEnd           = phase === 'end'

  // ── Handlers ──────────────────────────────────────────────

  function handlePlayerClick(idx) {
    if (!isPlayerTurn || isEnd) return
    if (targetMode && targetType === 'ally') {
      dispatch({ type: 'SELECT_TARGET', side: 'ally', idx })
      return
    }
    dispatch({ type: 'SELECT_CHAR', idx })
  }

  function handleEnemyClick(idx) {
    if (!isPlayerTurn || isEnd) return
    if (!targetMode || targetType !== 'enemy') return
    dispatch({ type: 'SELECT_TARGET', side: 'enemy', idx })
  }

  function handleSkill(skill) {
    if (!isPlayerTurn || selectedCharIdx === null) return
    dispatch({ type: 'SELECT_SKILL', skill })
  }

  function handleEndTurn() {
    if (!isPlayerTurn || isEnd) return
    dispatch({ type: 'END_TURN' })
  }

  function handleForfeit() {
    dispatch({ type: 'FORFEIT' })
  }

  function handleCancelTarget() {
    dispatch({ type: 'CANCEL_TARGET' })
  }

  function handleClaim() {
    dispatch({ type: 'CLAIM_BATTLE_RESULT' })
  }

  // Skills for selected fighter
  const skills = selectedFighter
    ? [...(selectedFighter.skills || []), BASIC_KUNAI, SUBSTITUTION]
    : []

  return (
    <div className="battle-screen">
      {/* ── Header ── */}
      <div className="battle-header">
        <div className="battle-turn-info">
          <span className="battle-turn">Turno {turn}</span>
          <span className={`battle-phase-badge ${phase === 'player' ? 'phase-player' : 'phase-ai'}`}>
            {phase === 'player' ? '⚔ Sua vez' : phase === 'ai' ? '🤖 IA' : '🏁 Fim'}
          </span>
        </div>
        <div className="battle-enemy-info">
          🎴 vs <strong>{enemyTeamName}</strong>
        </div>
        {!isEnd && (
          <button className="btn btn-danger btn-sm" onClick={handleForfeit}>
            🏳 Render-se
          </button>
        )}
      </div>

      {/* ── Enemy Team ── */}
      <div className="team-row enemy-row">
        <span className="team-label">Inimigo</span>
        <div className="fighters">
          {enemyTeam.map((fighter, idx) => (
            <FighterCard
              key={idx}
              fighter={fighter}
              isDead={fighter.currentHp <= 0}
              isTarget={!!(isPlayerTurn && targetMode && targetType === 'enemy' && fighter.currentHp > 0)}
              isIdle={!isPlayerTurn || !targetMode}
              onClick={() => handleEnemyClick(idx)}
            />
          ))}
        </div>
      </div>

      {/* ── Chakra + quick controls ── */}
      <div className="battle-middle">
        <ChakraDisplay chakra={chakra} />
        {!isEnd && (
          <button
            className="btn btn-primary"
            onClick={handleEndTurn}
            disabled={!isPlayerTurn}>
            ⏭ Encerrar Turno
          </button>
        )}
      </div>

      {/* ── Player Team ── */}
      <div className="team-row player-row">
        <span className="team-label">Aliado</span>
        <div className="fighters">
          {playerTeam.map((fighter, idx) => (
            <FighterCard
              key={idx}
              fighter={fighter}
              isDead={fighter.currentHp <= 0}
              isActive={selectedCharIdx === idx}
              isAllyTarget={!!(isPlayerTurn && targetMode && targetType === 'ally' && fighter.currentHp > 0)}
              isIdle={!isPlayerTurn || targetMode}
              onClick={() => handlePlayerClick(idx)}
            />
          ))}
        </div>
      </div>

      {/* ── Body: Log + Skill Panel ── */}
      <div className="battle-body">
        {/* Left: Log */}
        <div className="battle-left">
          {/* Target mode hint */}
          {targetMode && (
            <div className="target-hint">
              {targetType === 'enemy'
                ? '🎯 Clique em um INIMIGO para atacar'
                : '🤝 Clique em um ALIADO como alvo'}
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: '10px', padding: '3px 8px' }}
                onClick={handleCancelTarget}>
                ✕ Cancelar
              </button>
            </div>
          )}

          {/* Battle log */}
          <div className="battle-log" ref={logRef}>
            {(log || []).map((line, i) => (
              <div key={i} className="log-line">{line}</div>
            ))}
          </div>
        </div>

        {/* Right: Skill panel */}
        <div className="battle-right">
          <div className="skill-panel">
            {selectedFighter ? (
              <>
                <div className="skill-panel-title">
                  {selectedFighter.emoji} {selectedFighter.name.split(' ')[0]}
                  {selectedFighter.statuses.some(s => s.type === 'stun') && (
                    <span style={{ color: '#ff4444', marginLeft: 6, fontSize: '0.7rem' }}>
                      💫 ATORDOADO
                    </span>
                  )}
                </div>

                {selectedFighter.statuses.some(s => s.type === 'stun') ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 8px' }}>
                    💫 Personagem atordoado — não pode agir neste turno.
                  </div>
                ) : (
                  skills.map((sk, i) => (
                    <SkillButton
                      key={sk.id || i}
                      skill={sk}
                      fighter={selectedFighter}
                      chakra={chakra}
                      onClick={handleSkill}
                    />
                  ))
                )}
              </>
            ) : (
              <div className="skill-panel-hint">
                {isPlayerTurn
                  ? '👆 Selecione um personagem aliado para ver as habilidades'
                  : phase === 'ai'
                  ? '🤖 A IA está agindo...'
                  : '⚔ Batalha encerrada'}
              </div>
            )}
          </div>

          {/* Controls */}
          {!isEnd && (
            <div className="battle-controls">
              {targetMode ? (
                <button className="btn btn-ghost" onClick={handleCancelTarget}>
                  ✕ Cancelar Seleção
                </button>
              ) : (
                <button className="btn btn-ghost" onClick={handleCancelTarget}>
                  ↩ Desselecionar
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Battle Result Overlay ── */}
      {isEnd && <BattleResult battle={battle} onClaim={handleClaim} />}
    </div>
  )
}
