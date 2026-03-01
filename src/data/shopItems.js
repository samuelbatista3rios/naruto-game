// ============================================================
//  NARUTO ARENA — Loja de Itens
// ============================================================

const SHOP_ITEMS = [
  {
    id: 'potion_chakra',
    name: 'Poção de Chakra',
    desc: 'Começa a batalha com +3 de cada tipo de chakra.',
    emoji: '🔵',
    cost: 150,
    effect: 'extra_chakra',
    category: 'Ofensivo',
  },
  {
    id: 'scroll_power',
    name: 'Pergaminho de Força',
    desc: 'Todos os aliados ganham +25 de dano por toda a batalha.',
    emoji: '📜',
    cost: 200,
    effect: 'power_boost',
    category: 'Ofensivo',
  },
  {
    id: 'iron_armor',
    name: 'Armadura de Ferro',
    desc: 'Todos os aliados recebem um Escudo de 50 HP ao início da batalha.',
    emoji: '🛡',
    cost: 180,
    effect: 'start_shield',
    category: 'Defensivo',
  },
  {
    id: 'smoke_bomb',
    name: 'Bomba de Fumaça',
    desc: 'Todos os aliados ficam invulneráveis no primeiro turno.',
    emoji: '💨',
    cost: 250,
    effect: 'smoke_bomb',
    category: 'Defensivo',
  },
  {
    id: 'stamina_pill',
    name: 'Pílula de Estamina',
    desc: 'Todos os aliados iniciam com +50 de estamina máxima.',
    emoji: '💊',
    cost: 100,
    effect: 'extra_stamina',
    category: 'Suporte',
  },
  {
    id: 'fortune_scroll',
    name: 'Pergaminho da Fortuna',
    desc: 'Dobra os Ryō ganhos na próxima vitória.',
    emoji: '🪙',
    cost: 350,
    effect: 'double_ryo',
    category: 'Suporte',
  },
]

export default SHOP_ITEMS
