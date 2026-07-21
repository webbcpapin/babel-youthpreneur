import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { AuthProvider } from './auth/AuthProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HashRouter>,
)
