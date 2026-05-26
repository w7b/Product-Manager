import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#17171a',
            color: '#f0f0f2',
            border: '1px solid #2a2a32',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#17171a' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#17171a' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
