import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <a href="#inicio" className="skip-link">Saltar al contenido principal</a>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
