import { useState } from 'react'

import './App.css'
import Whiteboard from './components/Whiteboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Whiteboard />
      
    </>
  )
}

export default App
