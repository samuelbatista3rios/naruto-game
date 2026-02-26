// ============================================================
//  Times Inimigos Balanceados por Rank do Jogador
//  Genin -> nao enfrenta Akatsuki/S-rank
// ============================================================

export const ENEMY_TEAMS = {
  // ── Genin: apenas personagens fracos/Genin ──────────────
  genin: [
    { name: 'Time 7 Clássico',        chars: ['naruto_c','sasuke_c','sakura_c'] },
    { name: 'Time 9 de Rock Lee',     chars: ['rock_lee','neji','tenten'] },
    { name: 'Time 8 de Hinata',       chars: ['hinata','kiba','shino'] },
    { name: 'Time 10 de Shikamaru',   chars: ['shikamaru','choji','ino'] },
    { name: 'Irmãos da Areia',        chars: ['gaara','temari','kankuro'] },
    { name: 'Genins Sortidos',        chars: ['naruto_c','hinata','kiba'] },
    { name: 'Kunoichis',              chars: ['sakura_c','ino','tenten'] },
  
    { name: 'Time do Som',             chars: ['dosu','zaku','kin'] },
    { name: 'Alunos Sortidos',           chars: ['yoroi','iruka','kin'] },
],

  // ── Chunin: B-rank, nada S-rank ─────────────────────────
  chunin: [
    { name: 'Jonins da Folha',        chars: ['kakashi_c','asuma','kurenai'] },
    { name: 'Mercenários da Névoa',   chars: ['zabuza','haku','kankuro'] },
    { name: 'Examinadores do Exame',  chars: ['kakashi_c','neji','gaara'] },
    { name: 'Força de Areia',         chars: ['gaara','temari','kankuro'] },
    { name: 'Aliança da Folha',       chars: ['rock_lee','neji','hinata'] },
    { name: 'Guerreiros Sortidos',    chars: ['guy','asuma','kurenai'] },
    { name: 'Serviços Especiais',     chars: ['zabuza','kabuto','kimimaro'] },
  
    { name: 'Examinadores Especiais',   chars: ['anko','ibiki','hayate'] },
    { name: 'Jonins da Areia',           chars: ['baki','gaara','temari'] },
    { name: 'Espadachins Iniciantes',    chars: ['suigetsu','genma','hayate'] },
],

  // ── Jonin: A-rank, Akatsuki menores ─────────────────────
  jonin: [
    { name: 'Lendas da Folha',        chars: ['jiraiya','kakashi_c','guy'] },
    { name: 'Servos de Orochimaru',   chars: ['orochimaru','kabuto','kimimaro'] },
    { name: 'Artistas da Akatsuki',   chars: ['deidara','sasori','zetsu'] },
    { name: 'Duo Imortal + Espião',   chars: ['hidan','kakuzu','zetsu'] },
    { name: 'Shippuden Avançado',     chars: ['sakura_s','sai','yamato'] },
    { name: 'Sannin',                 chars: ['jiraiya','tsunade','orochimaru'] },
    { name: 'Akatsuki — Arte e Veneno', chars: ['deidara','sasori','konan'] },
  
    { name: 'Espadachins da Nevoa',     chars: ['suigetsu','ameyuri','chojuro'] },
    { name: 'Jinchuuriki Menores',       chars: ['utakata','fu','yugito'] },
    { name: 'Aliados da Areia',          chars: ['chiyo','rasa','baki'] },
    { name: 'Samurai e Aliados',         chars: ['mifune','darui','kurotsuchi'] },
],

  // ── Anbu: S-rank, Akatsuki poderosos ────────────────────
  anbu: [
    { name: 'Dupla S-Rank',           chars: ['itachi','kisame','konan'] },
    { name: 'Akatsuki Vol.1',         chars: ['itachi','deidara','hidan'] },
    { name: 'Akatsuki Vol.2',         chars: ['kisame','kakuzu','sasori'] },
    { name: 'Shippuden Elite',        chars: ['naruto_s','sasuke_s','kakashi_s'] },
    { name: 'Forças Especiais',       chars: ['kakashi_s','yamato','sai'] },
    { name: 'Uchiha e Companhia',     chars: ['itachi','sasuke_s','tobi'] },
    { name: 'Trio Akatsuki S-rank',   chars: ['pain','konan','zetsu'] },
  
    { name: 'Kages Aliados',             chars: ['hiruzen','chiyo','rasa'] },
    { name: 'Jinchuuriki Avancados',     chars: ['yugito','yagura','han'] },
    { name: 'Nuvem e Pedra',             chars: ['raikage_a','darui','onoki'] },
],

  // ── Kage: Líderes, Madara, Pain, Bijuu ──────────────────
  kage: [
    { name: 'Liderança Akatsuki',     chars: ['pain','konan','tobi'] },
    { name: 'Uchiha Supremo',         chars: ['madara','itachi','sasuke_s'] },
    { name: 'Lendas Ressuscitadas',   chars: ['madara','hashirama','minato'] },
    { name: 'Plano do Tsuki no Me',   chars: ['nagato','obito','konan'] },
    { name: 'Jinchuuriki Elite',      chars: ['naruto_bijuu','killerbee','gaara'] },
    { name: 'Deus e Demônios',        chars: ['hashirama','madara','nagato'] },
    { name: 'Akatsuki Final',         chars: ['pain','tobi','madara'] },
  
    { name: 'Cimeira dos Kages',         chars: ['raikage_a','mei','onoki'] },
    { name: 'Bijuu Supremos',            chars: ['yugito','yagura','han'] },
    { name: 'Hokage Lendarios',          chars: ['hiruzen','minato','hashirama'] },
],
}

// Retorna times para o rank atual do jogador
export function getEnemyTeamsForRank(rankName) {
  const map = {
    'Genin':  'genin',
    'Chunin': 'chunin',
    'Jonin':  'jonin',
    'Anbu':   'anbu',
    'Kage':   'kage',
  }
  const key = map[rankName] || 'genin'
  return ENEMY_TEAMS[key]
}

export default ENEMY_TEAMS
