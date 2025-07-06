import './App.css'
import Whiteboard from './components/Whiteboard.tsx'
import PlayersSidebar from './components/PlayersSidebar.tsx'

function App() {
  return (
    <>
      <h1 style={{ fontSize: '3rem', textAlign: 'center', margin: '32px 0 16px 0', fontWeight: 700 }}>Scribble</h1>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
        <PlayersSidebar />
        <Whiteboard />
      </div>
    </>
  )
}

export default App
