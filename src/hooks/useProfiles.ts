import { useEffect, useState } from 'react'
import { Profile, getPeerAPI } from '../lib/peer'

interface UseProfilesResult {
  profiles: Map<string, Profile>
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch and cache multiple profiles
 * @param addresses - Array of addresses to fetch profiles for
 * @returns Map of address -> Profile, loading state, and error
 */
function useProfiles(addresses: string[]): UseProfilesResult {
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (addresses.length === 0) {
      setProfiles(new Map())
      return
    }

    const fetchProfiles = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const peerAPI = getPeerAPI()
        const fetchedProfiles = await peerAPI.fetchProfiles(addresses, true)

        const profilesMap = new Map<string, Profile>()
        fetchedProfiles.forEach(profile => {
          profilesMap.set(profile.address, profile)
        })

        setProfiles(profilesMap)
      } catch (err) {
        console.error('[useProfiles] Error fetching profiles:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [addresses.join(',')]) // Re-fetch when addresses change

  return { profiles, isLoading, error }
}

/**
 * Hook to fetch a single profile
 * @param address - Address to fetch profile for
 * @returns Profile, loading state, and error
 */
function useProfile(address?: string): {
  profile: Profile | null
  isLoading: boolean
  error: Error | null
} {
  const addresses = address ? [address] : []
  const { profiles, isLoading, error } = useProfiles(addresses)

  return {
    profile: address ? profiles.get(address.toLowerCase()) || null : null,
    isLoading,
    error
  }
}

export type { UseProfilesResult }
export { useProfiles, useProfile }
