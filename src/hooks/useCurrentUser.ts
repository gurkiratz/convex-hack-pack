import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useCurrentUser() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.current)
  console.log(user?.name)
  // Combine the authentication state with the user existence check
  return {
    isLoading: isLoading || (isAuthenticated && user === null),
    isAuthenticated: isAuthenticated && user !== null,
    userId: user?.externalId,
  }
}
