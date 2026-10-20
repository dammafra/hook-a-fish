import { createRoot } from 'react-dom/client'
import App from './App'
import { loadLeva } from './hooks/use-controls'
import { isDebug } from './utils/debug'
import './index.css'

if (isDebug) await loadLeva()

createRoot(document.getElementById('root')!).render(<App />)
