import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Servers from './pages/Servers.jsx';
import ServerDetail from './pages/ServerDetail.jsx';
import './App.css'

function App() {
  
  return (
    <div className='app'>
      <header className='app-header' >
        <div className='max' >
          <Link to='/' className='brand'>Server Monitor</Link>
          <nav>
            <Link to='/' >Dashboard</Link>
            <Link to='/servers' >Servers</Link>
          </nav>
        </div>
      </header>
      <main className='max'>
        <Routers>
          <Route path='/' element={<Dashboard />} />
          <Route path='/servers' element={<Servers />} />
          <Route path='/servers/:id' element={<ServerDetail />} />
        </Routers>
      </main>
      <footer className='max muted small'>
          API: {window?.config?.API_BASE || import.meta.env.VITE_API_BASE || 'http://localhost:4000'} • WS: {window?.config?.WS_BASE || 'ws://localhost:4000'}
      </footer>
    </div>
  )
}

export default App
