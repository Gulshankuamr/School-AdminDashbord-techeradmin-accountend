import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Unauthorized() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const getDashboardPath = () => {
    return isLoggedIn ? '/admin' : '/login'
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <ShieldX className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-3 bg-gray-200 rounded-lg"
          >
            <ArrowLeft className="inline mr-2 h-4 w-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate(getDashboardPath())}
            className="px-5 py-3 bg-blue-600 text-white rounded-lg"
          >
            <Home className="inline mr-2 h-4 w-4" />
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Unauthorized
