import React, { createContext, useContext, useReducer, useEffect } from 'react'
import CHARACTERS, { BASIC_KUNAI, SUBSTITUTION } from '../data/characters'
import MISSIONS, { getRankByPoints } from '../data/missions'
import { getEnemyTeamsForRank } from '../data/enemyTeams'

const GameContext = createContext(null)

// ────────────────────────────────────────────────────────────
//  CONSTANTES
// ────────────────────────────────────────────────────────────
const STARTER_CHARS = [
  'naruto_c','sasuke_c','sakura_c','kakashi_c',
  'rock_lee','neji','shikamaru','gaara','hinata',
]

const CHAKRA_REGEN_PER_TURN = 3   // nº de chakras gerados por turno
const MAX_CHAKRA_PER_TYPE   = 9   // máximo por tipo

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────
function loadSave() {
  try { return JSON.parse(localStorage.getItem('narutoArena_v3')) } catch { return null }
}

function makeFighter(charId) {
  const base = CHARACTERS.find(c => c.id === charId)
  if (!base) return null
  return {
    ...base,
    currentHp: base.hp,
    maxHp: base.hp,
    statuses: [],          // { type, name, duration, dot?, hot?, power?, value? }
    cooldowns: {},         // { skillId: turnsLeft }
    substUsed: false,      // substituição já usada nesta batalha
    dmgBonus: 0,
    healBonus: 0,
    dmgReduction: base.passive?.type === 'damage_reduction' ? base.passive.value : 0,
  }
}

function randomEnemyTeam(rankName) {
  const teams = getEnemyTeamsForRank(rankName)
  const team  = teams[Math.floor(Math.random() * teams.length)]
  return {
    teamName: team.name,
    fighters: team.chars
      .map(id => makeFighter(id))
      .filter(Boolean),
  }
}

function generateChakra(current) {
  const types  = ['nin','tai','gen','ran']
  const result = { ...current }
  for (let i = 0; i < CHAKRA_REGEN_PER_TURN; i++) {
    const t = types[Math.floor(Math.random() * types.length)]
    result[t] = Math.min(MAX_CHAKRA_PER_TYPE, (result[t] || 0) + 1)
  }
  return result
}

function canAfford(skill, chakra) {
  if (skill.isBasic || skill.isSubstitution) return true
  return Object.entries(skill.cost).every(([t, n]) => (chakra[t] || 0) >= n)
}

function deductChakra(chakra, cost) {
  const next = { ...chakra }
  Object.entries(cost).forEach(([t, n]) => { next[t] = Math.max(0, (next[t] || 0) - n) })
  return next
}

function getCurrentRankName(rankPoints) {
  const ranks = [
    { name:'Genin', min:0 }, { name:'Chunin', min:100 },
    { name:'Jonin', min:300 }, { name:'Anbu', min:600 },
    { name:'Kage', min:1000 },
  ]
  return ranks.slice().reverse().find(r => rankPoints >= r.min)?.name || 'Genin'
}

// ────────────────────────────────────────────────────────────
//  MOTOR DE BATALHA — aplicar efeitos
// ────────────────────────────────────────────────────────────
function addStatus(fighter, status) {
  fighter.statuses = fighter.statuses.filter(s => s.type !== status.type)
  fighter.statuses.push({ ...status })
}

function applyEffect(effect, attacker, target, allAttackers, allDefenders) {
  if (!effect) return
  switch (effect) {
    case 'stun1': addStatus(target, { type:'stun', name:'Atordoado', duration:1 }); break
    case 'stun2': addStatus(target, { type:'stun', name:'Atordoado', duration:2 }); break
    case 'stun3': addStatus(target, { type:'stun', name:'Atordoado', duration:3 }); break
    case 'burn1': addStatus(target, { type:'burn', name:'Queimando', duration:1, dot:15 }); break
    case 'burn2': addStatus(target, { type:'burn', name:'Queimando', duration:2, dot:15 }); break
    case 'burn3': addStatus(target, { type:'burn', name:'Queimando', duration:3, dot:20 }); break
    case 'burn5': addStatus(target, { type:'burn', name:'Amaterasu', duration:5, dot:20 }); break
    case 'poison3': addStatus(target, { type:'burn', name:'Veneno', duration:3, dot:20 }); break
    case 'poison5': addStatus(target, { type:'burn', name:'Veneno+', duration:5, dot:25 }); break
    case 'bleed2': addStatus(target, { type:'bleed', name:'Sangrando', duration:2, dot:15 }); break
    case 'bleed3': addStatus(target, { type:'bleed', name:'Sangrando', duration:3, dot:15 }); break
    case 'bind':  addStatus(target, { type:'stun', name:'Preso', duration:2 }); break
    case 'confuse': addStatus(target, { type:'confuse', name:'Confuso', duration:1 }); break
    case 'shield':
      addStatus(attacker, { type:'shield', name:'Escudo', duration:2, power:55 }); break
    case 'shield_heavy':
      addStatus(attacker, { type:'shield', name:'Escudo+', duration:2, power:110 }); break
    case 'shield_team':
      allAttackers.forEach(f => {
        if (f.currentHp > 0) addStatus(f, { type:'shield', name:'Escudo+', duration:1, power:55 })
      }); break
    case 'fog_shield':
      allAttackers.forEach(f => {
        if (f.currentHp > 0) addStatus(f, { type:'invul', name:'Névoa', duration:1 })
      }); break
    case 'invul':
      addStatus(attacker, { type:'invul', name:'Invulnerável', duration:1 }); break
    case 'reflect_shield':
      addStatus(attacker, { type:'reflect', name:'Espelho', duration:2, power:25 }); break
    case 'counter':
      addStatus(attacker, { type:'counter', name:'Contra-ataque', duration:2 }); break
    case 'boost':
      attacker.dmgBonus += 25
      addStatus(attacker, { type:'boost', name:'Poder+', duration:3, value:25 }); break
    case 'boost_regen':
      attacker.dmgBonus += 20
      addStatus(attacker, { type:'boost', name:'Kyuubi', duration:3, value:20 })
      addStatus(attacker, { type:'regen', name:'Regenera', duration:3, hot:15 }); break
    case 'boost_tai':
      attacker.dmgBonus += 30
      addStatus(attacker, { type:'boost', name:'Tai+', duration:99, value:30 }); break
    case 'boost_pill':
      attacker.dmgBonus += 40
      attacker.currentHp = Math.max(1, attacker.currentHp - 15)
      addStatus(attacker, { type:'boost', name:'Pastilha', duration:3, value:40 }); break
    case 'regen':
      addStatus(attacker, { type:'regen', name:'Regenera', duration:2, hot:20 }); break
    case 'regen_big':
      addStatus(attacker, { type:'regen', name:'Regenera+', duration:3, hot:35 }); break
    case 'sage':
      attacker.dmgBonus += 40
      addStatus(attacker, { type:'boost', name:'Sábio', duration:3, value:40 })
      addStatus(attacker, { type:'regen', name:'Sábio-Regen', duration:3, hot:15 }); break
    case 'curse_mark':
      attacker.dmgBonus += 35
      addStatus(attacker, { type:'boost', name:'Maldição', duration:3, value:35 })
      addStatus(attacker, { type:'debuff', name:'Backlash', duration:3, dot:10 }); break
    case 'eight_gates':
      attacker.dmgBonus += 40
      addStatus(attacker, { type:'boost', name:'8 Portões', duration:3, value:40 })
      addStatus(attacker, { type:'regen', name:'Portões-Regen', duration:3, hot:10 })
      addStatus(attacker, { type:'gates_backlash', name:'Backlash', duration:5, dot:0, backlashAt:3 }); break
    case 'gates_death':
      attacker.currentHp = Math.max(1, attacker.currentHp - 80)
      addStatus(attacker, { type:'debuff', name:'Esgotado', duration:2, dot:20 }); break
    case 'shukaku_mode':
      addStatus(target, { type:'burn', name:'Areia-Queima', duration:3, dot:18 })
      addStatus(attacker, { type:'regen', name:'Shukaku-Regen', duration:2, hot:20 }); break
    case 'samehada_fusion':
      attacker.dmgBonus += 35
      addStatus(attacker, { type:'boost', name:'Samehada', duration:3, value:35 })
      addStatus(attacker, { type:'drain_aura', name:'Drain', duration:3 }); break
    case 'jashin_link':
      addStatus(target, { type:'jashin', name:'Maldição-Jashin', duration:2 }); break
    case 'jashin_mode':
      attacker.dmgBonus += 25
      addStatus(attacker, { type:'boost', name:'Jashin', duration:2, value:25 })
      addStatus(attacker, { type:'shield', name:'Jashin-Escudo', duration:2, power:40 }); break
    case 'curse_reflect':
      addStatus(target, { type:'burn', name:'Maldição', duration:3, dot:20 })
      addStatus(target, { type:'reflect', name:'Reflete', duration:2, power:30 }); break
    case 'self_sacrifice':
      attacker.currentHp = Math.max(1, attacker.currentHp - 100); break
    case 'pierce': break // ignora escudo – tratado no cálculo de dano
    case 'no_heal':
      addStatus(target, { type:'no_heal', name:'Sem Cura', duration:2 }); break
    case 'remove_buff':
      target.statuses = target.statuses.filter(s => s.type !== 'boost' && s.type !== 'shield'); break
    case 'cleanse':
      attacker.statuses = attacker.statuses.filter(s =>
        s.type !== 'burn' && s.type !== 'bleed' && s.type !== 'stun' && s.type !== 'debuff'
      ); break
    case 'analyze':
      addStatus(attacker, { type:'analyze', name:'Analisando', duration:2, value:0.2 }); break
    case 'chakra_drain': break // tratado acima no dano
    case 'big_chakra_drain': break
    case 'steal': break
    case 'copy_team':
      allDefenders.forEach(f => {
        if (f.currentHp > 0) addStatus(f, { type:'stun', name:'Controlado', duration:1 })
      }); break
    case 'heal': break // heal já tratado
    case 'heal_all': break
    case 'team_revive':
      allAttackers.forEach(f => {
        if (f.currentHp <= 0) {
          f.currentHp = Math.floor(f.maxHp * 0.35)
          f.statuses = f.statuses.filter(s => s.type !== 'revive')
        }
      })
      attacker.currentHp = 0  // Nagato morre ao usar
      break
    case 'revive':
      addStatus(target, { type:'revive', name:'Reviver', duration:99 }); break
    case 'absorb':
      addStatus(attacker, { type:'absorb', name:'Absorção', duration:1 }); break
    default: break
  }
}

// Aplica 1 ação de skill no estado de batalha
function resolveAction(battle, actorTeam, actorIdx, skill, targetTeam, targetIdx) {
  const isPlayer = (actorTeam === 'playerTeam')
  const defTeam  = isPlayer ? 'enemyTeam' : 'playerTeam'
  const atkKey   = isPlayer ? 'playerTeam' : 'enemyTeam'

  // clonar times
  const pT = battle.playerTeam.map(f => ({ ...f, statuses: f.statuses.map(s => ({ ...s })) }))
  const eT = battle.enemyTeam.map(f => ({ ...f, statuses: f.statuses.map(s => ({ ...s })) }))
  const atk = isPlayer ? pT : eT
  const def = isPlayer ? eT : pT

  const attacker = atk[actorIdx]
  if (!attacker || attacker.currentHp <= 0) return { ...battle, playerTeam: pT, enemyTeam: eT }

  // cooldowns
  if (!skill.isBasic && !skill.isSubstitution) {
    Object.keys(attacker.cooldowns).forEach(k => {
      if (attacker.cooldowns[k] > 0) attacker.cooldowns[k]--
    })
    if (skill.cooldown > 0) {
      attacker.cooldowns = { ...attacker.cooldowns, [skill.id]: skill.cooldown }
    }
  }
  if (skill.isSubstitution) attacker.substUsed = true

  const log = [...battle.log]
  const isPierce = skill.effect === 'pierce'

  const calcDmg = (base, defender) => {
    let dmg = base + (attacker.dmgBonus || 0)

    // Passive de low_hp_boost
    if (attacker.passive?.type === 'low_hp_boost' &&
        attacker.currentHp < attacker.maxHp * attacker.passive.threshold) {
      dmg += attacker.passive.value
    }
    // analyze (reduz dano recebido pelo attacker, mas aqui é dano causado)
    // analyze no defensor? n/a

    // Escudo
    const shield = isPierce ? null : defender.statuses.find(s => s.type === 'shield' || s.type === 'shield_heavy')
    if (shield && shield.power > 0) {
      const blocked = Math.min(dmg, shield.power)
      dmg -= blocked
      shield.power -= blocked
      if (shield.power <= 0) defender.statuses = defender.statuses.filter(s => s !== shield)
      if (blocked > 0) log.push(`🛡 Escudo absorveu ${blocked}!`)
    }

    // Invulnerável
    const invul = defender.statuses.find(s => s.type === 'invul')
    if (invul) { dmg = 0; log.push(`💨 ${defender.name.split(' ')[0]} desviou com Substituição!`) }

    // dmgReduction passivo
    if (defender.dmgReduction > 0) {
      const reduced = Math.floor(dmg * defender.dmgReduction)
      dmg -= reduced
    }

    // Analyze status (reduz dano recebido pelo DEF que analisou)
    const analyze = defender.statuses.find(s => s.type === 'analyze')
    if (analyze) { dmg = Math.floor(dmg * (1 - analyze.value)) }

    return Math.max(0, dmg)
  }

  const dealDamage = (defender, baseDmg) => {
    if (baseDmg <= 0) return 0
    const final = calcDmg(baseDmg, defender)
    defender.currentHp = Math.max(0, defender.currentHp - final)
    battle = { ...battle, damageDealt: (battle.damageDealt || 0) + final }
    return final
  }

  const doHeal = (target, amount) => {
    const hasNoHeal = target.statuses.find(s => s.type === 'no_heal')
    if (hasNoHeal) { log.push(`🚫 ${target.name.split(' ')[0]} não pode ser curado!`); return 0 }
    const bonus = (isPlayer ? attacker.healBonus : 0) || 0
    const actual = Math.min(target.maxHp - target.currentHp, amount + bonus)
    target.currentHp += actual
    return actual
  }

  // AoE — ataca TODOS os inimigos
  if (skill.target === 'all_enemy' || skill.target === 'all_ally') {
    const targets = skill.target === 'all_enemy' ? def : atk
    targets.forEach((t, idx) => {
      if (t.currentHp <= 0) return
      if (skill.damage > 0) {
        const d = dealDamage(t, skill.damage)
        if (d > 0) log.push(`${attacker.name.split(' ')[0]} → ${t.name.split(' ')[0]}: ${d} DMG`)
        applyEffect(skill.effect, attacker, t, atk, def)
      }
      if (skill.heal > 0) {
        const h = doHeal(t, skill.heal)
        if (h > 0) log.push(`${attacker.name.split(' ')[0]} curou ${t.name.split(' ')[0]}: +${h} HP`)
      }
    })
    if (!skill.damage && !skill.heal) {
      log.push(`${attacker.name.split(' ')[0]} usou ${skill.name}!`)
      applyEffect(skill.effect, attacker, attacker, atk, def)
    }
  }
  // Self
  else if (skill.target === 'self') {
    if (skill.damage > 0) {
      // dano em si mesmo (raro)
      const d = dealDamage(attacker, skill.damage)
      log.push(`${attacker.name.split(' ')[0]} usou ${skill.name}: ${d} DMG em si mesmo!`)
    }
    if (skill.heal > 0) {
      const h = doHeal(attacker, skill.heal)
      log.push(`${attacker.name.split(' ')[0]} curou a si mesmo: +${h} HP`)
    }
    applyEffect(skill.effect, attacker, attacker, atk, def)
    if (!skill.damage && !skill.heal) log.push(`${attacker.name.split(' ')[0]} usou ${skill.name}!`)
  }
  // Aliado
  else if (skill.target === 'ally') {
    const targetFighter = atk[targetIdx]
    if (!targetFighter) { return { ...battle, playerTeam: pT, enemyTeam: eT } }
    if (skill.heal > 0) {
      const h = doHeal(targetFighter, skill.heal)
      log.push(`${attacker.name.split(' ')[0]} curou ${targetFighter.name.split(' ')[0]}: +${h} HP`)
    }
    if (skill.damage > 0) {
      const d = dealDamage(targetFighter, skill.damage)
      log.push(`${attacker.name.split(' ')[0]} → ${targetFighter.name.split(' ')[0]}: ${d} DMG`)
    }
    applyEffect(skill.effect, attacker, targetFighter, atk, def)
    if (!skill.damage && !skill.heal) {
      log.push(`${attacker.name.split(' ')[0]} usou ${skill.name} em ${targetFighter.name.split(' ')[0]}!`)
    }
  }
  // Inimigo alvo único
  else {
    const targetFighter = def[targetIdx]
    if (!targetFighter || targetFighter.currentHp <= 0) {
      return { ...battle, playerTeam: pT, enemyTeam: eT }
    }
    if (skill.damage > 0) {
      const d = dealDamage(targetFighter, skill.damage)
      log.push(`${attacker.name.split(' ')[0]} usou ${skill.name} em ${targetFighter.name.split(' ')[0]}! (${d} DMG)`)
      applyEffect(skill.effect, attacker, targetFighter, atk, def)
    }
    if (skill.heal > 0) {
      // skill de dano com cura no inimigo é drain
      const h = doHeal(attacker, skill.heal)
      log.push(`${attacker.name.split(' ')[0]} drenando ${targetFighter.name.split(' ')[0]}: +${h} HP`)
    }
    if (!skill.damage && !skill.heal) {
      log.push(`${attacker.name.split(' ')[0]} usou ${skill.name} em ${targetFighter.name.split(' ')[0]}!`)
      applyEffect(skill.effect, attacker, targetFighter, atk, def)
    }

    // chakra drain
    if (skill.effect === 'chakra_drain' || skill.effect === 'big_chakra_drain') {
      if (isPlayer) {
        const drainAmt = skill.effect === 'big_chakra_drain' ? 3 : 1
        log.push(`🌀 Chakra drenado do inimigo!`)
      }
    }
  }

  return {
    ...battle,
    playerTeam: pT,
    enemyTeam: eT,
    log: log.slice(-50),
  }
}

// Processa DoT/HoT/Gates no início do turno
function tickStatuses(team) {
  return team.map(f => {
    if (f.currentHp <= 0) return f
    let hp = f.currentHp
    let dmgBonus = f.dmgBonus
    const next = []

    f.statuses.forEach(s => {
      if (s.dot > 0) hp = Math.max(0, hp - s.dot)
      if (s.hot > 0) hp = Math.min(f.maxHp, hp + s.hot)

      // Gates backlash
      if (s.type === 'gates_backlash') {
        const turns = s.backlashAt - 1
        if (turns <= 0) {
          // backlash ativo
          hp = Math.max(0, hp - 20)
          dmgBonus = Math.max(0, dmgBonus - 40)
          if (s.duration > 1) next.push({ ...s, duration: s.duration - 1, dot: 20, backlashAt: 0 })
          return
        }
        next.push({ ...s, backlashAt: turns, duration: s.duration - 1 })
        return
      }

      if (s.duration > 1) next.push({ ...s, duration: s.duration - 1 })
      else if (s.type === 'boost' || s.type === 'sage' || s.type === 'samehada_fusion') {
        dmgBonus = Math.max(0, dmgBonus - (s.value || 0))
      }
    })

    // Passivo regen
    if (f.passive?.type === 'regen_passive') {
      hp = Math.min(f.maxHp, hp + f.passive.hot)
    }

    // Revive
    if (hp <= 0) {
      const revive = next.find(s => s.type === 'revive')
      if (revive) {
        hp = Math.floor(f.maxHp * 0.5)
        const filtered = next.filter(s => s !== revive)
        return { ...f, currentHp: hp, statuses: filtered, dmgBonus }
      }
    }

    return { ...f, currentHp: hp, statuses: next, dmgBonus }
  })
}

function checkWinner(playerTeam, enemyTeam) {
  if (!playerTeam.some(f => f.currentHp > 0)) return 'enemy'
  if (!enemyTeam.some(f => f.currentHp > 0)) return 'player'
  return null
}

// ────────────────────────────────────────────────────────────
//  IA — Turno do Inimigo
// ────────────────────────────────────────────────────────────
function runAiTurn(battle) {
  let b = { ...battle }
  const log = [...b.log]
  log.push('— IA age —')

  b.enemyTeam.forEach((enemy, eIdx) => {
    if (enemy.currentHp <= 0) return
    if (enemy.statuses.find(s => s.type === 'stun')) {
      log.push(`${enemy.name.split(' ')[0]} está atordoado!`)
      return
    }

    const alivePlayers = b.playerTeam.filter(f => f.currentHp > 0)
    if (!alivePlayers.length) return

    // AI escolhe skill baseado em estratégia simples
    const aiChakra = { nin:5, tai:5, gen:5, blood:4, ran:4 } // IA tem chakra ilimitado simplificado
    const available = enemy.skills.filter(sk =>
      canAfford(sk, aiChakra) && !(enemy.cooldowns[sk.id] > 0)
    )
    if (!available.length) {
      // usa kunai básico
      const weakest = alivePlayers.reduce((m, p) => p.currentHp < m.currentHp ? p : m, alivePlayers[0])
      const tIdx = b.playerTeam.indexOf(weakest)
      b = resolveAction(b, 'enemyTeam', eIdx, BASIC_KUNAI, 'playerTeam', tIdx)
      return
    }

    // Prioridade: cura se HP baixo, senão maior dano
    let chosen = available[0]
    if (enemy.currentHp < enemy.maxHp * 0.35) {
      const heal = available.find(sk => sk.heal > 0 || sk.effect?.includes('regen') || sk.effect?.includes('shield'))
      if (heal) chosen = heal
    } else {
      // prefere maior dano
      chosen = available.reduce((best, sk) => {
        const dmg = sk.damage + (sk.target === 'all_enemy' ? 1000 : 0)
        const bestDmg = best.damage + (best.target === 'all_enemy' ? 1000 : 0)
        return dmg > bestDmg ? sk : best
      }, available[0])
    }

    // Alvo: mais fraco do time do jogador
    const weakest = alivePlayers.reduce((m, p) => p.currentHp < m.currentHp ? p : m, alivePlayers[0])
    const tIdx = b.playerTeam.indexOf(weakest)

    b = resolveAction(b, 'enemyTeam', eIdx, chosen, 'playerTeam', tIdx)
    b.enemyTeam[eIdx] = {
      ...b.enemyTeam[eIdx],
      cooldowns: { ...b.enemyTeam[eIdx].cooldowns, ...(chosen.cooldown ? { [chosen.id]: chosen.cooldown } : {}) }
    }
  })

  b.log = [...(b.log || []), ...log].slice(-50)
  return b
}

// ────────────────────────────────────────────────────────────
//  ESTADO INICIAL
// ────────────────────────────────────────────────────────────
function makeInitialState() {
  const saved = loadSave()
  if (saved?.player) return { ...saved, screen:'menu', battle:null }
  return {
    screen: 'menu',
    player: {
      name: 'Shinobi',
      rankPoints: 0,
      wins: 0, losses: 0, streak: 0,
      ryo: 500,
      totalDamage: 0,
      totalBattles: 0,
      unlockedChars: [...STARTER_CHARS],
      completedMissions: [],
      missionProgress: {},
    },
    selectedTeam: [],
    battle: null,
  }
}

// ────────────────────────────────────────────────────────────
//  REDUCER
// ────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'SET_PLAYER_NAME':
      return { ...state, player: { ...state.player, name: action.name } }

    case 'TOGGLE_CHAR': {
      const { id } = action
      if (!state.player.unlockedChars.includes(id)) return state
      const team = state.selectedTeam
      if (team.includes(id)) return { ...state, selectedTeam: team.filter(c => c !== id) }
      if (team.length >= 3) return state
      return { ...state, selectedTeam: [...team, id] }
    }

    case 'REMOVE_FROM_TEAM':
      return { ...state, selectedTeam: state.selectedTeam.filter(c => c !== action.id) }

    case 'START_BATTLE': {
      const rankName  = getCurrentRankName(state.player.rankPoints || 0)
      const enemy     = randomEnemyTeam(rankName)
      const playerTeam = state.selectedTeam.map(id => makeFighter(id)).filter(Boolean)
      const chakra     = generateChakra({ nin:2, tai:2, gen:2, blood:0, ran:1 })
      return {
        ...state,
        screen: 'battle',
        battle: {
          playerTeam,
          enemyTeam: enemy.fighters,
          enemyTeamName: enemy.teamName,
          chakra,
          turn: 1,
          phase: 'player',          // 'player' | 'ai' | 'end'
          selectedCharIdx: null,    // índice do personagem selecionado
          pendingSkill: null,       // skill aguardando alvo
          targetMode: false,        // aguardando clique de alvo
          targetType: null,         // 'enemy' | 'ally'
          log: [`⚔ Batalha vs ${enemy.teamName} — Lute!`],
          winner: null,
          damageDealt: 0,
          allAlive: true,
        },
      }
    }

    case 'SELECT_CHAR': {
      const b = state.battle
      if (b.phase !== 'player') return state
      const f = b.playerTeam[action.idx]
      if (!f || f.currentHp <= 0) return state
      if (f.statuses.find(s => s.type === 'stun')) {
        const log = [...b.log, `${f.name.split(' ')[0]} está atordoado!`]
        return { ...state, battle: { ...b, log } }
      }
      return { ...state, battle: { ...b, selectedCharIdx: action.idx, pendingSkill: null, targetMode: false } }
    }

    case 'SELECT_SKILL': {
      const b = state.battle
      if (b.phase !== 'player' || b.selectedCharIdx === null) return state
      const fighter = b.playerTeam[b.selectedCharIdx]
      const skill   = action.skill

      if (!skill.isBasic && !skill.isSubstitution) {
        if (!canAfford(skill, b.chakra)) return state
        const onCd = fighter.cooldowns[skill.id] > 0
        if (onCd) return state
      }
      if (skill.isSubstitution && fighter.substUsed) return state

      // Se skill é AoE ou self → executa imediatamente
      if (skill.target === 'all_enemy' || skill.target === 'all_ally' || skill.target === 'self') {
        let newState = reducer(state, {
          type: '_EXECUTE', charIdx: b.selectedCharIdx, skill,
          targetSide: 'player', targetIdx: b.selectedCharIdx,
        })
        return newState
      }

      // Precisa de alvo
      const tType = skill.target === 'ally' ? 'ally' : 'enemy'
      return { ...state, battle: { ...b, pendingSkill: skill, targetMode: true, targetType: tType } }
    }

    case 'SELECT_TARGET': {
      const b = state.battle
      if (!b.targetMode || !b.pendingSkill) return state
      return reducer(state, {
        type: '_EXECUTE', charIdx: b.selectedCharIdx, skill: b.pendingSkill,
        targetSide: action.side, targetIdx: action.idx,
      })
    }

    case '_EXECUTE': {
      const b = state.battle
      const { charIdx, skill, targetSide, targetIdx } = action

      // Deduzir chakra
      let chakra = b.chakra
      if (!skill.isBasic && !skill.isSubstitution) {
        chakra = deductChakra(chakra, skill.cost)
      }

      // Marcar substituição usada
      let playerTeam = b.playerTeam.map((f, i) => {
        if (i === charIdx && skill.isSubstitution) return { ...f, substUsed: true }
        return f
      })
      let tmpBattle = { ...b, playerTeam, chakra }

      // Executar ação
      tmpBattle = resolveAction(tmpBattle, 'playerTeam', charIdx, skill, targetSide, targetIdx)

      // Verificar vitória
      const winner = checkWinner(tmpBattle.playerTeam, tmpBattle.enemyTeam)

      // Atualizar progresso de missões
      const p = state.player
      const progress = { ...p.missionProgress }
      const dmg = (tmpBattle.damageDealt || 0) - (b.damageDealt || 0)
      if (dmg > 0) {
        progress.deal_damage = (progress.deal_damage || 0) + dmg
        if (charIdx !== undefined) {
          const cid = b.playerTeam[charIdx]?.id
          if (cid) progress[`deal_damage_with_char_${cid}`] = (progress[`deal_damage_with_char_${cid}`] || 0) + dmg
        }
      }
      progress.use_skill = (progress.use_skill || 0) + 1
      if (skill.id) progress[`use_skill_id_${skill.id}`] = (progress[`use_skill_id_${skill.id}`] || 0) + 1

      if (winner) {
        return {
          ...state,
          player: { ...p, missionProgress: progress, totalDamage: (p.totalDamage || 0) + (tmpBattle.damageDealt || 0) },
          battle: { ...tmpBattle, phase: 'end', winner, pendingSkill: null, targetMode: false },
        }
      }

      return {
        ...state,
        player: { ...p, missionProgress: progress },
        battle: { ...tmpBattle, phase: 'player', pendingSkill: null, targetMode: false, selectedCharIdx: null },
      }
    }

    case 'END_TURN': {
      const b = state.battle
      if (b.phase !== 'player') return state

      // Tick status nos dois times
      let pTeam = tickStatuses(b.playerTeam)
      let eTeam = tickStatuses(b.enemyTeam)
      let winner = checkWinner(pTeam, eTeam)
      if (winner) {
        return { ...state, battle: { ...b, playerTeam: pTeam, enemyTeam: eTeam, phase: 'end', winner } }
      }

      // Gerar chakra
      const chakra = generateChakra(b.chakra)
      const newTurn = b.turn + 1
      const log = [...b.log, `⚔ Turno ${newTurn} — Chakra gerado!`]

      // IA age
      let aiState = {
        ...b,
        playerTeam: pTeam,
        enemyTeam: eTeam,
        chakra,
        turn: newTurn,
        log,
        phase: 'ai',
      }
      aiState = runAiTurn(aiState)

      // Tick novamente após IA
      let pTeam2 = tickStatuses(aiState.playerTeam)
      let eTeam2 = tickStatuses(aiState.enemyTeam)
      winner = checkWinner(pTeam2, eTeam2)

      const allAlive = pTeam2.every(f => f.currentHp > 0)

      return {
        ...state,
        battle: {
          ...aiState,
          playerTeam: pTeam2,
          enemyTeam: eTeam2,
          phase: winner ? 'end' : 'player',
          winner: winner || null,
          allAlive: b.allAlive && allAlive,
          selectedCharIdx: null,
          pendingSkill: null,
          targetMode: false,
        },
      }
    }

    case 'FORFEIT': {
      const b = state.battle
      const p = { ...state.player }
      p.losses = (p.losses || 0) + 1
      p.streak = 0
      p.totalBattles = (p.totalBattles || 0) + 1
      p.ryo = (p.ryo || 0) + 10
      return {
        ...state,
        player: p,
        battle: b ? { ...b, phase: 'end', winner: 'enemy' } : null,
      }
    }

    case 'CLAIM_BATTLE_RESULT': {
      const b = state.battle
      if (!b || b.winner === null) return state
      const win = b.winner === 'player'
      const p   = { ...state.player }
      const progress = { ...p.missionProgress }

      const ryoGain = win ? 100 + Math.floor(Math.random() * 150) + b.turn * 5 : 15
      p.wins        = (p.wins || 0) + (win ? 1 : 0)
      p.losses      = (p.losses || 0) + (win ? 0 : 1)
      p.streak      = win ? (p.streak || 0) + 1 : 0
      p.ryo         = (p.ryo || 0) + ryoGain
      p.totalBattles = (p.totalBattles || 0) + 1
      p.totalDamage  = (p.totalDamage || 0) + (b.damageDealt || 0)

      if (win) {
        progress.win_battles  = (progress.win_battles || 0) + 1
        progress.win_streak   = p.streak
        if (b.allAlive) progress.perfect_win = (progress.perfect_win || 0) + 1

        // vitória com personagem específico
        state.selectedTeam.forEach(cid => {
          progress[`win_with_char_${cid}`] = (progress[`win_with_char_${cid}`] || 0) + 1
        })
        // vitória com série
        const hasShi = state.selectedTeam.some(id => {
          const c = CHARACTERS.find(x => x.id === id); return c?.series === 'shippuden' || c?.series === 'akatsuki'
        })
        if (hasShi) progress.win_with_series_shippuden = (progress.win_with_series_shippuden || 0) + 1
      }

      p.missionProgress = progress
      return {
        ...state,
        player: p,
        screen: 'menu',
        battle: null,
      }
    }

    case 'CLAIM_MISSION': {
      const { missionId } = action
      const mission = MISSIONS.find(m => m.id === missionId)
      if (!mission || state.player.completedMissions.includes(missionId)) return state

      const p = { ...state.player }
      p.completedMissions = [...p.completedMissions, missionId]
      p.ryo = (p.ryo || 0) + mission.rewards.ryo
      p.rankPoints = (p.rankPoints || 0) + mission.rewards.rankPoints

      if (mission.unlockChar && !p.unlockedChars.includes(mission.unlockChar)) {
        p.unlockedChars = [...p.unlockedChars, mission.unlockChar]
      }
      return { ...state, player: p }
    }

    case 'CANCEL_TARGET':
      return { ...state, battle: { ...state.battle, pendingSkill: null, targetMode: false, selectedCharIdx: null } }

    default:
      return state
  }
}

// ────────────────────────────────────────────────────────────
//  PROVIDER
// ────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState)

  useEffect(() => {
    const toSave = { ...state, battle: null, screen: 'menu' }
    localStorage.setItem('narutoArena_v3', JSON.stringify(toSave))
  }, [state.player, state.selectedTeam])

  const rankName = getCurrentRankName(state.player?.rankPoints || 0)

  return (
    <GameContext.Provider value={{ ...state, dispatch, rankName }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  return useContext(GameContext)
}

export { getCurrentRankName }
