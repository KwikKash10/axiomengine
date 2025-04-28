import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import InoAIPremium from './pages/InoAIPremium'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'

const App = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize app and simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
      // Hide loading screen
      const loadingEl = document.querySelector('#loading-screen') as HTMLElement
      if (loadingEl) {
        loadingEl.classList.remove('visible')
        setTimeout(() => {
          loadingEl.style.display = 'none'
        }, 300)
      }
    }, 1500) // Short loading time for better UX

    return () => clearTimeout(timer)
  }, [])

  // While loading, return null to keep the loading screen visible
  if (loading) {
    return null
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<InoAIPremium />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App 