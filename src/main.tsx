import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {BrowserRouter, RouterProvider} from 'react-router-dom'
import {AppProvider} from './context/AppContext'
import {QueryClient,QueryClientProvider} from 'react-query'

const queryClient = new QueryClient()
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  
   <div className='dark'>
    <AppProvider>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App/>
        </QueryClientProvider>
      </BrowserRouter>
    </AppProvider>
   </div> 
    
  ,
)
