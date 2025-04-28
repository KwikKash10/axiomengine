import { Link } from 'react-router-dom'
import { FiAlertTriangle } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <FiAlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-medium text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="px-6 py-2 bg-primary hover:bg-secondary text-white rounded-md font-medium transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound 