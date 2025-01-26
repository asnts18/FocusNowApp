import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import FocusTodoApp from './FocusTodoApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FocusTodoApp />
  </StrictMode>,
)
