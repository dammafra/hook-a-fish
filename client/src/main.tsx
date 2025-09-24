import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

await window.PokiSDK.init()
createRoot(document.getElementById('root')!).render(<App />)
