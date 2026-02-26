import React from 'react'
import { GameProvider, useGame } from './context/GameContext'
import MainMenu from './components/MainMenu'
import CharacterSelect from './components/CharacterSelect'
import BattleScreen from './components/BattleScreen'
import MissionBoard from './components/MissionBoard'
import CharacterRoster from './components/CharacterRoster'

function AppContent() {
  const { screen } = useGame()
  return (
    <div className="app">
      {screen === 'menu'    && <MainMenu />}
      {screen === 'select'  && <CharacterSelect />}
      {screen === 'battle'  && <BattleScreen />}
      {screen === 'missions'&& <MissionBoard />}
      {screen === 'roster'  && <CharacterRoster />}
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
