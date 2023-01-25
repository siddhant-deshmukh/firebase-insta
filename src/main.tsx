import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {BrowserRouter, RouterProvider} from 'react-router-dom'
import {AppProvider} from './context/AppContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
)
