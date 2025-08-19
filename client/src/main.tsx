import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)

createRoot(document.getElementById('root')!).render(<App />)
