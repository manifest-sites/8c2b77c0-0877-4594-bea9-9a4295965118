import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Monetization from './components/monetization/Monetization'
import HelloWorld from './components/HelloWorld'
import About from './components/About'
import CRM from './components/CRM'
import Navigation from './components/Navigation'
import { getRouterBasename } from './utils/routerUtils'

function App() {

  return (
    <Monetization>
      <Router basename={getRouterBasename()}>
        <Navigation />
        <Routes>
          <Route path="/" element={<HelloWorld />} />
          <Route path="/about" element={<About />} />
          <Route path="/crm" element={<CRM />} />
        </Routes>
      </Router>
    </Monetization>
  )
}

export default App