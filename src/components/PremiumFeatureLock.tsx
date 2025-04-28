import React from 'react'
import { useAuth } from '../contexts/SupabaseAuthContext'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { FiLock } from 'react-icons/fi'

interface PremiumFeatureLockProps {
  children: React.ReactNode
  featureName?: string
}

/**
 * PremiumFeatureLock - Gates content based on the user's subscription status
 * 
 * This component checks if a user has a premium subscription and either:
 * 1. Shows the children components if user is premium
 * 2. Shows an upgrade prompt if user is on the free plan
 */
const PremiumFeatureLock: React.FC<PremiumFeatureLockProps> = ({
  children,
  featureName = 'this feature'
}) => {
  const { isLoading } = useAuth()

  // For this deployment, always show the premium content
  // In the actual implementation, this would check the user's subscription status
  const isPremium = true

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  // If user is premium, show the content
  if (isPremium) {
    return <>{children}</>
  }

  // Show premium lock for non-premium users
  return (
    <Card className="p-6">
      <div className="text-center">
        <FiLock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Premium Feature</h3>
        <p className="mt-1 text-sm text-gray-500">
          {featureName} is available for premium users only.
        </p>
        <div className="mt-6">
          <Button
            className="w-full"
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default PremiumFeatureLock 