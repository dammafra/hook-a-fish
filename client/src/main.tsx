import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

await window.CrazyGames.SDK.init()
window.CrazyGames.SDK.game.loadingStart()
createRoot(document.getElementById('root')!).render(<App />)
