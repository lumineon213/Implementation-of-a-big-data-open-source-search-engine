import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DarkModeProvider } from './contexts/DarkModeContext.tsx'
import './i18n/config'

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
    <BrowserRouter>
      <DarkModeProvider>
        <App />
      </DarkModeProvider>
    </BrowserRouter>
  //</StrictMode>,
)
