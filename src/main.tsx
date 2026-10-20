import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerPWA } from './utils/pwa'

registerPWA()

createRoot(document.getElementById('root')!).render(<App />)
