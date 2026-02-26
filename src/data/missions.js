// ============================================================
//  NARUTO ARENA – Missões e Sistema de Graduação
//  Ranks: Genin → Chunin → Jonin → Anbu → Kage
// ============================================================

export const RANK_INFO = [
  { rank: 'Genin',  minPoints: 0,    color: '#22AA44', desc: 'Iniciante da aldeia' },
  { rank: 'Chunin', minPoints: 300,  color: '#0088FF', desc: 'Ninja intermediário' },
  { rank: 'Jonin',  minPoints: 800,  color: '#AA44FF', desc: 'Ninja de elite' },
  { rank: 'Anbu',   minPoints: 1800, color: '#CC2222', desc: 'Força especial secreta' },
  { rank: 'Kage',   minPoints: 3500, color: '#FFCC00', desc: 'Líder supremo de Vila' },
]

export const getRankByPoints = (pts) => {
  return RANK_INFO.slice().reverse().find(r => pts >= r.minPoints) || RANK_INFO[0]
}

// ============================================================
//  DEFINIÇÃO DAS MISSÕES
// ============================================================
// type: 'win_battles' | 'use_skill' | 'deal_damage' | 'heal_hp'
//       | 'win_with_char' | 'use_char' | 'perfect_win' | 'win_streak'
// ============================================================

const MISSIONS = [

  // ─── RANK D — Missões de Genin ─────────────────────────────
  {
    id: 'g01', category: 'Genin', difficulty: 'D-Rank',
    name: 'Primeira Missão',
    desc: 'Vença sua primeira batalha.',
    type: 'win_battles', target: 1,
    rewards: { rankPoints: 10, ryo: 50 },
    unlockChar: null,
  },
  {
    id: 'g02', category: 'Genin', difficulty: 'D-Rank',
    name: 'Usuário de Jutsu',
    desc: 'Use 10 habilidades em batalhas.',
    type: 'use_skill', target: 10,
    rewards: { rankPoints: 10, ryo: 40 },
    unlockChar: null,
  },
  {
    id: 'g03', category: 'Genin', difficulty: 'D-Rank',
    name: 'Acredite!',
    desc: 'Vença 3 batalhas usando Naruto Clássico no time.',
    type: 'win_with_char', charId: 'naruto_c', target: 3,
    rewards: { rankPoints: 15, ryo: 80 },
    unlockChar: null,
  },
  {
    id: 'g04', category: 'Genin', difficulty: 'D-Rank',
    name: 'Primeiro Sangue',
    desc: 'Cause 300 de dano total em batalhas.',
    type: 'deal_damage', target: 300,
    rewards: { rankPoints: 15, ryo: 60 },
    unlockChar: null,
  },
  {
    id: 'g05', category: 'Genin', difficulty: 'D-Rank',
    name: 'Sharingan Ativado',
    desc: 'Use Sharingan Genjutsu 3 vezes.',
    type: 'use_skill_id', skillId: 'sasuke_c_2', target: 3,
    rewards: { rankPoints: 15, ryo: 70 },
    unlockChar: null,
  },
  {
    id: 'g06', category: 'Genin', difficulty: 'C-Rank',
    name: 'Médica em Treinamento',
    desc: 'Cure 200 HP total com Sakura Clássica.',
    type: 'heal_with_char', charId: 'sakura_c', target: 200,
    rewards: { rankPoints: 20, ryo: 100 },
    unlockChar: 'tenten',
  },
  {
    id: 'g07', category: 'Genin', difficulty: 'C-Rank',
    name: 'Artilharia',
    desc: 'Cause 800 de dano total em batalhas.',
    type: 'deal_damage', target: 800,
    rewards: { rankPoints: 25, ryo: 120 },
    unlockChar: 'kiba',
  },
  {
    id: 'g08', category: 'Genin', difficulty: 'C-Rank',
    name: 'Sobrevivente',
    desc: 'Vença 5 batalhas no total.',
    type: 'win_battles', target: 5,
    rewards: { rankPoints: 25, ryo: 150 },
    unlockChar: 'shino',
  },

  // ─── RANK C — Exame Chunin ─────────────────────────────────
  {
    id: 'c01', category: 'Exame Chunin', difficulty: 'C-Rank',
    name: 'Fase 1: Escrita',
    desc: 'Vença uma batalha usando apenas personagens C-Rank ou B-Rank.',
    type: 'win_battles', target: 1,
    rewards: { rankPoints: 30, ryo: 150 },
    unlockChar: 'choji',
  },
  {
    id: 'c02', category: 'Exame Chunin', difficulty: 'C-Rank',
    name: 'Fase 2: Floresta da Morte',
    desc: 'Vença 3 batalhas sem usar itens de cura.',
    type: 'win_battles', target: 3,
    rewards: { rankPoints: 30, ryo: 150 },
    unlockChar: 'ino',
  },
  {
    id: 'c03', category: 'Exame Chunin', difficulty: 'C-Rank',
    name: 'O Poder de Lee',
    desc: 'Cause 500 de dano usando Rock Lee.',
    type: 'deal_damage_with_char', charId: 'rock_lee', target: 500,
    rewards: { rankPoints: 35, ryo: 180 },
    unlockChar: null,
  },
  {
    id: 'c04', category: 'Exame Chunin', difficulty: 'C-Rank',
    name: 'Estrategista',
    desc: 'Use Análise Tática de Shikamaru 5 vezes.',
    type: 'use_skill_id', skillId: 'shika_1', target: 5,
    rewards: { rankPoints: 35, ryo: 200 },
    unlockChar: null,
  },
  {
    id: 'c05', category: 'Exame Chunin', difficulty: 'B-Rank',
    name: 'Passe Pela Arena',
    desc: 'Vença 3 batalhas sem que nenhum aliado morra.',
    type: 'perfect_win', target: 3,
    rewards: { rankPoints: 50, ryo: 300 },
    unlockChar: 'temari',
  },
  {
    id: 'c06', category: 'Exame Chunin', difficulty: 'B-Rank',
    name: 'Ventos da Areia',
    desc: 'Vença 2 batalhas usando Gaara no time.',
    type: 'win_with_char', charId: 'gaara', target: 2,
    rewards: { rankPoints: 50, ryo: 250 },
    unlockChar: 'kankuro',
  },
  {
    id: 'c07', category: 'Exame Chunin', difficulty: 'B-Rank',
    name: 'Graduado!',
    desc: 'Alcance 300 pontos de rank para se tornar Chunin. Vença batalhas e complete missões para subir.',
    type: 'rank_points', target: 300,
    rewards: { rankPoints: 0, ryo: 500 },
    unlockChar: 'zabuza',
  },

  // ─── RANK B — Missões de Jonin ─────────────────────────────
  {
    id: 'j01', category: 'Missões Jonin', difficulty: 'B-Rank',
    name: 'Jōnin da Folha',
    desc: 'Vença 10 batalhas no total.',
    type: 'win_battles', target: 10,
    rewards: { rankPoints: 50, ryo: 400 },
    unlockChar: 'haku',
  },
  {
    id: 'j02', category: 'Missões Jonin', difficulty: 'B-Rank',
    name: 'Mestre do Chidori',
    desc: 'Use o Chidori de Kakashi 5 vezes.',
    type: 'use_skill_id', skillId: 'kakashi_c_3', target: 5,
    rewards: { rankPoints: 50, ryo: 350 },
    unlockChar: null,
  },
  {
    id: 'j03', category: 'Missões Jonin', difficulty: 'B-Rank',
    name: 'Chuva de Dano',
    desc: 'Cause 2000 de dano total em batalhas.',
    type: 'deal_damage', target: 2000,
    rewards: { rankPoints: 60, ryo: 400 },
    unlockChar: 'asuma',
  },
  {
    id: 'j04', category: 'Missões Jonin', difficulty: 'B-Rank',
    name: 'Anjo da Névoa',
    desc: 'Vença 2 batalhas usando Zabuza no time.',
    type: 'win_with_char', charId: 'zabuza', target: 2,
    rewards: { rankPoints: 60, ryo: 450 },
    unlockChar: 'kabuto',
  },
  {
    id: 'j05', category: 'Missões Jonin', difficulty: 'A-Rank',
    name: 'Criatura Bonita',
    desc: 'Cause 300 de dano com Oito Portões Internos de Rock Lee.',
    type: 'use_skill_id', skillId: 'lee_4', target: 1,
    rewards: { rankPoints: 70, ryo: 500 },
    unlockChar: 'guy',
  },
  {
    id: 'j06', category: 'Missões Jonin', difficulty: 'A-Rank',
    name: 'Sem Deixar Rastros',
    desc: 'Vença 5 batalhas sem perder nenhum personagem (vitórias perfeitas).',
    type: 'perfect_win', target: 5,
    rewards: { rankPoints: 80, ryo: 600 },
    unlockChar: 'jiraiya',
  },
  {
    id: 'j07', category: 'Missões Jonin', difficulty: 'A-Rank',
    name: 'Promovido a Jonin',
    desc: 'Alcance 800 pontos de rank para se tornar Jonin. Provar que é um ninja de elite.',
    type: 'rank_points', target: 800,
    rewards: { rankPoints: 0, ryo: 1000 },
    unlockChar: 'tsunade',
  },

  // ─── RANK A — Missões ANBU ─────────────────────────────────
  {
    id: 'a01', category: 'Operações ANBU', difficulty: 'A-Rank',
    name: 'Força dos Sannin',
    desc: 'Use Jiraiya, Tsunade ou Orochimaru e vença 3 batalhas.',
    type: 'win_with_char', charId: 'jiraiya', target: 3,
    rewards: { rankPoints: 80, ryo: 700 },
    unlockChar: 'orochimaru',
  },
  {
    id: 'a02', category: 'Operações ANBU', difficulty: 'A-Rank',
    name: 'Fogo Negro',
    desc: 'Use Amaterasu de Itachi 3 vezes.',
    type: 'use_skill_id', skillId: 'itachi_2', target: 3,
    rewards: { rankPoints: 90, ryo: 800 },
    unlockChar: null,
  },
  {
    id: 'a03', category: 'Operações ANBU', difficulty: 'A-Rank',
    name: 'Destruidor',
    desc: 'Cause 5000 de dano total em batalhas.',
    type: 'deal_damage', target: 5000,
    rewards: { rankPoints: 100, ryo: 900 },
    unlockChar: 'kisame',
  },
  {
    id: 'a04', category: 'Operações ANBU', difficulty: 'A-Rank',
    name: 'Lenda Vermelha',
    desc: 'Vença 20 batalhas no total.',
    type: 'win_battles', target: 20,
    rewards: { rankPoints: 100, ryo: 1000 },
    unlockChar: 'itachi',
  },
  {
    id: 'a05', category: 'Operações ANBU', difficulty: 'A-Rank',
    name: 'Shinobi Shippuden',
    desc: 'Vença 3 batalhas usando personagens Shippuden.',
    type: 'win_with_series', series: 'shippuden', target: 3,
    rewards: { rankPoints: 110, ryo: 1000 },
    unlockChar: 'naruto_s',
  },
  {
    id: 'a06', category: 'Operações ANBU', difficulty: 'S-Rank',
    name: 'Força Anbu',
    desc: 'Alcance 1800 pontos de rank para entrar no ANBU. Apenas os melhores chegam aqui.',
    type: 'rank_points', target: 1800,
    rewards: { rankPoints: 0, ryo: 2000 },
    unlockChar: 'sasuke_s',
  },

  // ─── RANK S — Missões Kage ─────────────────────────────────
  {
    id: 'k01', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'Nível Kage',
    desc: 'Vença 30 batalhas no total.',
    type: 'win_battles', target: 30,
    rewards: { rankPoints: 150, ryo: 2000 },
    unlockChar: 'sakura_s',
  },
  {
    id: 'k02', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'Devastação Total',
    desc: 'Cause 10000 de dano total em batalhas.',
    type: 'deal_damage', target: 10000,
    rewards: { rankPoints: 150, ryo: 2000 },
    unlockChar: 'kakashi_s',
  },
  {
    id: 'k03', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'Invicto',
    desc: 'Vença 10 batalhas consecutivas sem perder.',
    type: 'win_streak', target: 10,
    rewards: { rankPoints: 200, ryo: 3000 },
    unlockChar: 'sai',
  },
  {
    id: 'k04', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'Deus da Chuva',
    desc: 'Vença 5 batalhas usando Pain no time.',
    type: 'win_with_char', charId: 'pain', target: 5,
    rewards: { rankPoints: 200, ryo: 2500 },
    unlockChar: 'konan',
  },
  {
    id: 'k05', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'A Bee que Rima',
    desc: 'Vença 3 batalhas usando Killer Bee.',
    type: 'win_with_char', charId: 'killerbee', target: 3,
    rewards: { rankPoints: 150, ryo: 2000 },
    unlockChar: 'yamato',
  },
  {
    id: 'k06', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'Relâmpago Amarelo',
    desc: 'Cause 200 de dano com Rasengan do Pai de Minato.',
    type: 'use_skill_id', skillId: 'minato_3', target: 3,
    rewards: { rankPoints: 200, ryo: 3000 },
    unlockChar: 'minato',
  },
  {
    id: 'k07', category: 'Missões de Kage', difficulty: 'S-Rank',
    name: 'Lenda dos Lendários',
    desc: 'Alcance 3500 pontos de rank para se tornar Kage. O título máximo de shinobi.',
    type: 'rank_points', target: 3500,
    rewards: { rankPoints: 0, ryo: 5000 },
    unlockChar: 'pain',
  },

  // ─── RANK S+ — Missões Secretas ───────────────────────────
  {
    id: 's01', category: 'Missões Secretas', difficulty: 'S-Rank',
    name: 'O Último Uchiha',
    desc: 'Vença 5 batalhas usando Itachi Uchiha.',
    type: 'win_with_char', charId: 'itachi', target: 5,
    rewards: { rankPoints: 200, ryo: 3000 },
    unlockChar: 'tobi',
  },
  {
    id: 's02', category: 'Missões Secretas', difficulty: 'S-Rank',
    name: 'O Ser Mais Forte',
    desc: 'Vença 5 batalhas usando Madara.',
    type: 'win_with_char', charId: 'madara', target: 5,
    rewards: { rankPoints: 250, ryo: 5000 },
    unlockChar: 'hashirama',
  },
  {
    id: 's03', category: 'Missões Secretas', difficulty: 'S-Rank',
    name: 'Rinne-Sharingan',
    desc: 'Use Rinne Tensei de Nagato (ressuscita aliados).',
    type: 'use_skill_id', skillId: 'nagato_4', target: 1,
    rewards: { rankPoints: 200, ryo: 4000 },
    unlockChar: 'nagato',
  },
  {
    id: 's04', category: 'Missões Secretas', difficulty: 'S-Rank',
    name: 'Modo Bijuu Completo',
    desc: 'Vença 3 batalhas usando Naruto Modo Bijuu.',
    type: 'win_with_char', charId: 'naruto_bijuu', target: 3,
    rewards: { rankPoints: 250, ryo: 5000 },
    unlockChar: null,
  },
  {
    id: 's05', category: 'Missões Secretas', difficulty: 'S-Rank',
    name: 'Deus dos Shinobi',
    desc: 'Alcance 50 vitórias totais.',
    type: 'win_battles', target: 50,
    rewards: { rankPoints: 300, ryo: 10000 },
    unlockChar: 'obito',
  },
  {
    id: 's06', category: 'Missões Secretas', difficulty: 'S-Rank',
    name: 'Mestre de Todas as Artes',
    desc: 'Cause 20000 de dano total no jogo inteiro.',
    type: 'deal_damage', target: 20000,
    rewards: { rankPoints: 300, ryo: 8000 },
    unlockChar: 'naruto_bijuu',
  },
]

export default MISSIONS
