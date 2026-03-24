import React, { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'
import { BASIC_KUNAI, SUBSTITUTION } from '../data/characters'
import CharAvatar, { SkillIcon } from './CharAvatar'
import BattleArena3D from './BattleArena3D'

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const CHAKRA_META = [
  { key: 'nin',   label: 'NIN',  color: '#ff4400' },
  { key: 'tai',   label: 'TAI',  color: '#0088ff' },
  { key: 'gen',   label: 'GEN',  color: '#aa44ff' },
  { key: 'blood', label: 'KEK',  color: '#cc0022' },
  { key: 'ran',   label: 'RAN',  color: '#888888' },
]

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function canAfford(skill, chakra) {
  if (skill.isBasic || skill.isSubstitution) return true
  return Object.entries(skill.cost || {}).every(([t, n]) => (chakra[t] || 0) >= n)
}
function canAffordStamina(skill, fighter) {
  if (!skill.isBasic && !skill.isSubstitution) return true
  return (fighter?.currentStamina || 0) >= (skill.staminaCost || 0)
}
function hpGradient(pct) {
  if (pct > 55) return 'linear-gradient(90deg,#1a7a33,#33cc55)'
  if (pct > 25) return 'linear-gradient(90deg,#886600,#ddaa00)'
  return 'linear-gradient(90deg,#881100,#dd3300)'
}
function stColor(pct) {
  if (pct > 50) return '#22aaff'
  if (pct > 20) return '#ff9900'
  return '#cc2222'
}
function logClass(line = '') {
  const l = line.toLowerCase()
  if (l.includes('vitória') || l.includes('venceu')) return 'log-win'
  if (l.includes('derrota') || l.includes('derrotado') || l.includes('caiu')) return 'log-die'
  if (l.includes('turno') && (l.includes('início') || l.includes('fase'))) return 'log-turn'
  if (l.includes('cura') || l.includes('recupera') || (l.includes('+') && l.includes('hp'))) return 'log-heal'
  if (l.includes('recebe') && /\d/.test(l)) return 'log-dmg'
  if (l.includes('atordoa') || l.includes('queima') || l.includes('sangra') || l.includes('status')) return 'log-status'
  if (l.includes('chakra') || l.includes('nin') || l.includes('tai') || l.includes('gen')) return 'log-chakra'
  if (l.includes('usa') || l.includes('ativa') || l.includes('lança')) return 'log-action'
  if (l.includes('escudo') || l.includes('invulner') || l.includes('proteg')) return 'log-shield'
  return ''
}

// ─────────────────────────────────────────────────────────────
//  ChakraDisplay — row of typed orbs
// ─────────────────────────────────────────────────────────────
function ChakraDisplay({ chakra }) {
  return (
    <div className="na-chakra-display">
      {CHAKRA_META.map(t => {
        const count = chakra[t.key] || 0
        return (
          <div key={t.key} className="na-chakra-type">
            <span className="na-chakra-label" style={{ color: t.color }}>{t.label}</span>
            <div className="na-chakra-orbs">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className="na-chakra-orb"
                  style={{
                    background: i < count ? t.color : 'rgba(20,20,30,0.8)',
                    boxShadow: i < count ? `0 0 5px ${t.color}88` : 'none',
                    opacity: i < count ? 1 : 0.25,
                  }}
                />
              ))}
            </div>
            <span className="na-chakra-count" style={{ color: count > 0 ? t.color : '#444' }}>
              {count}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  StatusBadges
// ─────────────────────────────────────────────────────────────
const STATUS_CSS   = { stun:'s-stun', burn:'s-burn', bleed:'s-bleed', shield:'s-shield', invul:'s-invul', regen:'s-regen', boost:'s-boost', debuff:'s-debuff', revive:'s-revive', jashin:'s-jashin', gates_backlash:'s-burn' }
const STATUS_ICONS = { stun:'💫', burn:'🔥', bleed:'🩸', shield:'🛡', invul:'💨', regen:'💚', boost:'⬆', debuff:'⬇', revive:'☯', jashin:'☠', gates_backlash:'⚡' }
function StatusBadges({ statuses }) {
  if (!statuses?.length) return null
  return (
    <div className="fighter-statuses">
      {statuses.slice(0, 4).map((s, i) => (
        <span key={i} className={`status-badge ${STATUS_CSS[s.type] || 's-other'}`}>
          {STATUS_ICONS[s.type] || '?'}{s.duration < 99 ? s.duration : ''}
        </span>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  FighterRow — horizontal Naruto Arena style card
// ─────────────────────────────────────────────────────────────
function FighterRow({ fighter, isActive, isTarget, isAllyTarget, isDead, hasActed, isStunned, showStamina, animClass, onClick }) {
  const pct  = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100)
  const stPct= Math.max(0, ((fighter.currentStamina||0) / (fighter.maxStamina||100)) * 100)

  let cls = 'nfr'
  if (isDead)          cls += ' nfr-dead'
  else if (hasActed)   cls += ' nfr-acted'
  else if (isActive)   cls += ' nfr-active'
  else if (isTarget)   cls += ' nfr-target'
  else if (isAllyTarget) cls += ' nfr-ally'

  return (
    <div
      className={`${cls}${animClass ? ` ${animClass}` : ''}`}
      style={{ '--char-color': fighter.color || '#ff8c00' }}
      onClick={!isDead ? onClick : undefined}
    >
      {/* Portrait */}
      <div className="nfr-portrait">
        <CharAvatar char={fighter} size="lg" shape="square" isDead={isDead || hasActed} />
        {hasActed && !isDead && <div className="nfr-badge nfr-acted-badge">✓</div>}
        {isStunned && !isDead && !hasActed && <div className="nfr-badge nfr-stun-badge">💫</div>}
      </div>

      {/* Info */}
      <div className="nfr-info">
        <div className="nfr-name" style={{ color: isDead ? '#444' : hasActed ? '#555' : undefined }}>
          {fighter.name.split(' ').slice(0, 2).join(' ')}
        </div>

        {!isDead && (
          <>
            <div className="nfr-hp-row">
              <div className="nfr-hp-bar">
                <div className="nfr-hp-fill" style={{ width: `${pct}%`, background: hpGradient(pct) }} />
              </div>
              <span className="nfr-hp-text">{fighter.currentHp}/{fighter.maxHp}</span>
            </div>

            {showStamina && (
              <div className="nfr-st-row">
                <div className="nfr-st-bar">
                  <div className="nfr-st-fill" style={{ width: `${stPct}%`, background: stColor(stPct) }} />
                </div>
                <span className="nfr-st-text">ST {fighter.currentStamina||0}</span>
              </div>
            )}

            <StatusBadges statuses={fighter.statuses} />
          </>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  SkillButton — compact, 2-col grid style
// ─────────────────────────────────────────────────────────────
const CHAKRA_COLORS = { nin:'#ff4400', tai:'#0088ff', gen:'#aa44ff', blood:'#cc0022', ran:'#888888' }

function CostPips({ cost }) {
  const pips = []
  Object.entries(cost || {}).forEach(([t, n]) => { for (let i=0;i<n;i++) pips.push(t) })
  if (!pips.length) return <span className="na-free-tag">Livre</span>
  return (
    <div className="na-cost-pips">
      {pips.map((t, i) => (
        <div key={i} className="na-pip" style={{ background: CHAKRA_COLORS[t] || '#888' }}>
          {t[0].toUpperCase()}
        </div>
      ))}
    </div>
  )
}

function SkillButton({ skill, fighter, chakra, onClick }) {
  const affordable   = canAfford(skill, chakra)
  const staminaOk    = canAffordStamina(skill, fighter)
  const onCooldown   = !skill.isBasic && !skill.isSubstitution && (fighter.cooldowns?.[skill.id] > 0)
  const substUsed    = skill.isSubstitution && fighter.substUsed
  const disabled     = !affordable || !staminaOk || onCooldown || substUsed

  let extra = ''
  if (skill.isBasic)        extra = ' sk-basic'
  if (skill.isSubstitution) extra = ` sk-subst${substUsed ? ' sk-used' : ''}`

  return (
    <button
      className={`na-skill-btn${extra}`}
      disabled={disabled}
      onClick={() => !disabled && onClick(skill)}
      title={skill.desc}
    >
      {/* Cooldown overlay */}
      {(onCooldown || substUsed) && (
        <div className="na-sk-overlay">
          {onCooldown ? `⏳${fighter.cooldowns[skill.id]}t` : '✕'}
        </div>
      )}

      {/* Icon row */}
      <div className="na-sk-icon">
        <SkillIcon skill={skill} size={26} />
      </div>

      {/* Name */}
      <div className="na-sk-name">{skill.name}</div>

      {/* Meta: damage + cost */}
      <div className="na-sk-meta">
        {skill.damage > 0 && <span className="na-sk-dmg">⚔{skill.damage}</span>}
        {skill.heal   > 0 && <span className="na-sk-heal">+{skill.heal}</span>}
        {(skill.isBasic || skill.isSubstitution) && skill.staminaCost > 0 && (
          <span className="na-sk-st">💧{skill.staminaCost}</span>
        )}
        <CostPips cost={skill.cost} />
      </div>

      {!affordable && !onCooldown && !substUsed && (
        <div className="na-sk-warn">Chakra ✗</div>
      )}
      {!staminaOk && !onCooldown && !substUsed && affordable && (
        <div className="na-sk-warn">ST ✗</div>
      )}
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
              <span className="result-stat-val" style={{ color:'#ffcc00' }}>
                +{100 + Math.floor(Math.random()*100)}
              </span>
              <span className="result-stat-lbl">Ryō</span>
            </div>
          )}
        </div>
        <button className={`btn btn-lg ${win ? 'btn-success' : 'btn-danger'}`} onClick={onClaim}>
          {win ? '🏅 Reivindicar Recompensas' : '↩ Voltar ao Menu'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  BattleScreen — main
// ─────────────────────────────────────────────────────────────
export default function BattleScreen() {
  const { battle, dispatch } = useGame()
  const logRef       = useRef(null)
  const prevHPRef    = useRef(null)
  const animTimerRef = useRef(null)
  const [hitAnims, setHitAnims] = useState({ player:{}, enemy:{} })

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [battle?.log])

  // HP change → trigger hit/heal anim
  useEffect(() => {
    if (!battle) { prevHPRef.current = null; return }
    if (prevHPRef.current) {
      const newAnims = { player:{}, enemy:{} }
      battle.playerTeam.forEach((f, i) => {
        const prev = prevHPRef.current.playerTeam[i]?.hp
        if (prev === undefined) return
        if (f.currentHp < prev) newAnims.player[i] = 'hit-anim'
        else if (f.currentHp > prev) newAnims.player[i] = 'heal-anim'
      })
      battle.enemyTeam.forEach((f, i) => {
        const prev = prevHPRef.current.enemyTeam[i]?.hp
        if (prev === undefined) return
        if (f.currentHp < prev) newAnims.enemy[i] = 'hit-anim'
        else if (f.currentHp > prev) newAnims.enemy[i] = 'heal-anim'
      })
      const has = Object.keys(newAnims.player).length || Object.keys(newAnims.enemy).length
      if (has) {
        clearTimeout(animTimerRef.current)
        setHitAnims(newAnims)
        animTimerRef.current = setTimeout(() => setHitAnims({ player:{}, enemy:{} }), 520)
      }
    }
    prevHPRef.current = {
      playerTeam: battle.playerTeam.map(f => ({ hp: f.currentHp })),
      enemyTeam:  battle.enemyTeam.map(f => ({ hp: f.currentHp })),
    }
  }, [battle])

  // Auto end-turn when all alive chars acted
  useEffect(() => {
    if (!battle || battle.phase !== 'player' || battle.winner) return
    const alive = battle.playerTeam.map((f,i) => f.currentHp>0 ? i : -1).filter(i=>i>=0)
    if (!alive.length) return
    if (alive.every(i => (battle.actedThisTurn||[]).includes(i))) {
      const t = setTimeout(() => dispatch({ type:'END_TURN' }), 700)
      return () => clearTimeout(t)
    }
  }, [battle?.actedThisTurn, battle?.phase, battle?.winner])

  if (!battle) return null

  const {
    playerTeam, enemyTeam, chakra, turn, phase, winner,
    selectedCharIdx, targetMode, targetType, log, enemyTeamName,
    actedThisTurn = [],
  } = battle

  const selectedFighter  = selectedCharIdx !== null ? playerTeam[selectedCharIdx] : null
  const isPlayerTurn     = phase === 'player'
  const isEnd            = phase === 'end'
  const selectedHasActed = selectedCharIdx !== null && actedThisTurn.includes(selectedCharIdx)

  // ── Handlers ──────────────────────────────────────────────
  function handlePlayerClick(idx) {
    if (!isPlayerTurn || isEnd) return
    if (targetMode && targetType === 'ally') { dispatch({ type:'SELECT_TARGET', side:'ally', idx }); return }
    dispatch({ type:'SELECT_CHAR', idx })
  }
  function handleEnemyClick(idx) {
    if (!isPlayerTurn || isEnd || !targetMode || targetType !== 'enemy') return
    dispatch({ type:'SELECT_TARGET', side:'enemy', idx })
  }
  function handleSkill(skill) {
    if (!isPlayerTurn || selectedCharIdx === null) return
    dispatch({ type:'SELECT_SKILL', skill })
  }
  function handleEndTurn() { if (!isPlayerTurn || isEnd) return; dispatch({ type:'END_TURN' }) }
  function handleForfeit()  { dispatch({ type:'FORFEIT' }) }
  function handleCancelTarget() { dispatch({ type:'CANCEL_TARGET' }) }
  function handleClaim()    { dispatch({ type:'CLAIM_BATTLE_RESULT' }) }

  const skills = selectedFighter
    ? [...(selectedFighter.skills || []), BASIC_KUNAI, SUBSTITUTION]
    : []

  const aliveActed = actedThisTurn.filter(i => playerTeam[i]?.currentHp > 0).length
  const aliveTotal = playerTeam.filter(f => f.currentHp > 0).length

  return (
    <div className="battle-screen">
      <BattleArena3D phase={phase} />

      {/* ── Top header ── */}
      <div className="na-header bs-layer">
        <div className="na-header-left">
          <span className="na-turn-num">TURNO {turn}</span>
          <span className={`na-phase-badge ${phase==='player' ? 'nph-player' : 'nph-ai'}`}>
            {phase==='player' ? '⚔ SUA VEZ' : phase==='ai' ? '🤖 IA' : '🏁 FIM'}
          </span>
        </div>
        <div className="na-header-center">
          🎴 <strong>{enemyTeamName}</strong>
        </div>
        <div className="na-header-right">
          {!isEnd && (
            <button className="btn btn-danger btn-sm" onClick={handleForfeit}>
              🏳 Render-se
            </button>
          )}
        </div>
      </div>

      {/* ── Main 3-column arena ── */}
      <div className="na-arena bs-layer">

        {/* LEFT — Enemy team */}
        <div className="na-team-col na-enemy-col">
          <div className="na-col-label enemy-label">▼ INIMIGO</div>
          {enemyTeam.map((fighter, idx) => (
            <FighterRow
              key={idx}
              fighter={fighter}
              isDead={fighter.currentHp <= 0}
              isTarget={!!(isPlayerTurn && targetMode && targetType==='enemy' && fighter.currentHp > 0)}
              animClass={hitAnims.enemy[idx]}
              onClick={() => handleEnemyClick(idx)}
            />
          ))}
        </div>

        {/* CENTER — Chakra + Skills + Log */}
        <div className="na-center-col">

          {/* Chakra bar */}
          <ChakraDisplay chakra={chakra} />

          {/* Target mode banner */}
          {targetMode && (
            <div className="na-target-banner">
              <span>
                {targetType==='enemy' ? '🎯 Clique no INIMIGO para atacar' : '🤝 Clique no ALIADO como alvo'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleCancelTarget}>✕</button>
            </div>
          )}

          {/* Skill panel */}
          <div className="na-skill-panel">
            {selectedFighter ? (
              <>
                <div className="na-sk-header">
                  <CharAvatar char={selectedFighter} size="sm" shape="circle" isDead={selectedHasActed} />
                  <div className="na-sk-char-name">{selectedFighter.name.split(' ')[0]}</div>
                  {selectedHasActed && <span className="na-sk-acted-tag">✓ Agiu</span>}
                  {!selectedHasActed && selectedFighter.statuses.some(s=>s.type==='stun') && (
                    <span className="na-sk-stun-tag">💫 Atordoado</span>
                  )}
                </div>

                {selectedHasActed ? (
                  <div className="na-sk-acted-msg">
                    ✓ {selectedFighter.name.split(' ')[0]} já agiu neste turno.
                    <span> Encerre o turno ou escolha outro personagem.</span>
                  </div>
                ) : selectedFighter.statuses.some(s=>s.type==='stun') ? (
                  <div className="na-sk-acted-msg">💫 Atordoado — não pode agir.</div>
                ) : (
                  <div className="na-skill-grid">
                    {skills.map((sk, i) => (
                      <SkillButton key={sk.id||i} skill={sk} fighter={selectedFighter} chakra={chakra} onClick={handleSkill} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="na-sk-hint">
                {isPlayerTurn
                  ? `👆 Selecione um personagem (${aliveActed}/${aliveTotal} agiram)`
                  : phase==='ai'
                  ? '🤖 A IA está executando sua jogada...'
                  : '⚔ Batalha encerrada'}
              </div>
            )}
          </div>

          {/* Battle log */}
          <div className="na-battle-log" ref={logRef}>
            {(log||[]).map((line, i) => (
              <div key={i} className={`log-line ${logClass(line)}`}>{line}</div>
            ))}
          </div>

          {/* Bottom controls */}
          {!isEnd && (
            <div className="na-bottom-bar">
              {!targetMode ? (
                <button className="btn btn-ghost btn-sm" onClick={handleCancelTarget}>
                  ↩ Desselecionar
                </button>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={handleCancelTarget}>
                  ✕ Cancelar
                </button>
              )}
              <button
                className="btn btn-primary na-end-turn-btn"
                onClick={handleEndTurn}
                disabled={!isPlayerTurn}
              >
                ⏭ ENCERRAR TURNO
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Player team */}
        <div className="na-team-col na-player-col">
          <div className="na-col-label player-label">▼ ALIADO</div>
          {playerTeam.map((fighter, idx) => (
            <FighterRow
              key={idx}
              fighter={fighter}
              isDead={fighter.currentHp <= 0}
              isActive={selectedCharIdx === idx}
              isAllyTarget={!!(isPlayerTurn && targetMode && targetType==='ally' && fighter.currentHp > 0)}
              hasActed={!!(fighter.currentHp > 0 && actedThisTurn.includes(idx))}
              isStunned={!!(fighter.currentHp > 0 && fighter.statuses?.some(s=>s.type==='stun'))}
              showStamina
              animClass={hitAnims.player[idx]}
              onClick={() => handlePlayerClick(idx)}
            />
          ))}
        </div>

      </div>

      {/* ── Result overlay ── */}
      {isEnd && <BattleResult battle={battle} onClaim={handleClaim} />}
    </div>
  )
}
