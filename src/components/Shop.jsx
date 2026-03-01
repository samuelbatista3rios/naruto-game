import React from 'react'
import { useGame } from '../context/GameContext'
import SHOP_ITEMS from '../data/shopItems'

const CATEGORY_COLORS = {
  Ofensivo:  '#ff6600',
  Defensivo: '#0088ff',
  Suporte:   '#22aa44',
}

function ItemCard({ item, owned, equipped, canAfford, onBuy, onEquip }) {
  const catColor = CATEGORY_COLORS[item.category] || '#888'
  return (
    <div className="shop-item-card" style={{ borderColor: equipped ? catColor : undefined }}>
      <div className="shop-item-header">
        <span className="shop-item-emoji">{item.emoji}</span>
        <div className="shop-item-info">
          <div className="shop-item-name">{item.name}</div>
          <span className="shop-item-cat" style={{ color: catColor }}>{item.category}</span>
        </div>
        {owned > 0 && (
          <span className="shop-item-owned">x{owned}</span>
        )}
      </div>
      <div className="shop-item-desc">{item.desc}</div>
      <div className="shop-item-footer">
        <span className="shop-item-cost">
          💰 {item.cost.toLocaleString()} Ryō
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {owned > 0 && (
            <button
              className={`btn btn-sm ${equipped ? 'btn-success' : 'btn-ghost'}`}
              onClick={() => onEquip(item.id)}
            >
              {equipped ? '✓ Equipado' : 'Equipar'}
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            disabled={!canAfford}
            onClick={() => onBuy(item.id)}
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const { player, dispatch } = useGame()
  const ryo = player.ryo || 0
  const inventory = player.shopInventory || {}
  const equippedItem = player.equippedItem

  function handleBuy(itemId) {
    dispatch({ type: 'BUY_ITEM', itemId })
  }

  function handleEquip(itemId) {
    dispatch({ type: 'EQUIP_ITEM', itemId })
  }

  const categories = [...new Set(SHOP_ITEMS.map(i => i.category))]
  const equippedData = equippedItem ? SHOP_ITEMS.find(i => i.id === equippedItem) : null

  return (
    <div className="shop-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'menu' })}>
          ←
        </button>
        <h1>🏪 Loja</h1>
        <div className="shop-ryo-badge">
          💰 {ryo.toLocaleString()} Ryō
        </div>
      </div>

      {/* Equipado atual */}
      {equippedData && (
        <div className="shop-equipped-banner">
          <span>{equippedData.emoji} <strong>{equippedData.name}</strong> equipado para a próxima batalha!</span>
          <button className="btn btn-ghost btn-sm" onClick={() => handleEquip(equippedItem)}>
            ✕ Remover
          </button>
        </div>
      )}

      {/* Itens por categoria */}
      {categories.map(cat => (
        <div key={cat} className="shop-section">
          <div className="shop-section-title" style={{ color: CATEGORY_COLORS[cat] || '#888' }}>
            {cat}
          </div>
          <div className="shop-items-grid">
            {SHOP_ITEMS.filter(i => i.category === cat).map(item => (
              <ItemCard
                key={item.id}
                item={item}
                owned={inventory[item.id] || 0}
                equipped={equippedItem === item.id}
                canAfford={ryo >= item.cost}
                onBuy={handleBuy}
                onEquip={handleEquip}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="shop-tip">
        💡 Equipe um item antes de batalhar. O item é consumido ao iniciar a batalha.
      </div>
    </div>
  )
}
