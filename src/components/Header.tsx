import { Link } from 'react-router-dom'
import AxiomEngineLogo from './AxiomEngineLogo'

const Header = () => {
  return (
    <header className="border-b border-gray-200 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <AxiomEngineLogo className="w-8 h-8" />
          <span className="font-game text-xl font-bold tracking-wide text-gray-900">
            AXIOM ENGINE
          </span>
        </Link>
        <nav className="flex items-center space-x-6">
          <a 
            href="https://getino.app/dashboard" 
            className="text-gray-700 hover:text-primary transition-colors font-medium"
          >
            Dashboard
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Header 