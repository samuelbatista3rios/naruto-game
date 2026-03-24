import React, { lazy, Suspense } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import MainMenu from './components/MainMenu'
import CharacterSelect from './components/CharacterSelect'
const BattleScreen = lazy(() => import('./components/BattleScreen'))
import MissionBoard from './components/MissionBoard'
import CharacterRoster from './components/CharacterRoster'
import Shop from './components/Shop'

function AppContent() {
  const { screen } = useGame()
  return (
    <div className="app">
      {screen === 'menu'    && <MainMenu />}
      {screen === 'select'  && <CharacterSelect />}
      {screen === 'battle'  && <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#ff8c00',fontSize:'1.1rem'}}>⚔ Carregando arena...</div>}><BattleScreen /></Suspense>}
      {screen === 'missions'&& <MissionBoard />}
      {screen === 'roster'  && <CharacterRoster />}
      {screen === 'shop'    && <Shop />}
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
