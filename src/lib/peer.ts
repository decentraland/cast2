/**
 * Minimal Peer API client for fetching Decentraland profiles
 */

import type { Avatar } from '@dcl/schemas/dist/platform/profile'

interface Profile {
  address: string
  name?: string
  hasClaimedName: boolean
  avatarFace256?: string
}

class PeerAPI {
  private baseUrl: string
  private cache: Map<string, Promise<Profile>>

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.cache = new Map()
  }

  /**
   * Fetch a single profile by address with caching
   */
  async fetchProfile(address: string, useCache = true): Promise<Profile> {
    const addressLower = address.toLowerCase()

    if (useCache && this.cache.has(addressLower)) {
      return this.cache.get(addressLower)!
    }

    const promise = this.fetchProfiles([addressLower]).then(profiles => profiles[0])
    this.cache.set(addressLower, promise)

    return promise
  }

  /**
   * Fetch multiple profiles by addresses with caching
   */
  async fetchProfiles(addresses: string[], useCache = true): Promise<Profile[]> {
    const addressesLower = addresses.map(a => a.toLowerCase())
    const uncachedAddresses: string[] = []
    const cachedProfiles: Map<string, Promise<Profile>> = new Map()

    // Separate cached from uncached
    for (const address of addressesLower) {
      if (useCache && this.cache.has(address)) {
        cachedProfiles.set(address, this.cache.get(address)!)
      } else {
        uncachedAddresses.push(address)
      }
    }

    // Fetch uncached profiles
    let newProfiles: Profile[] = []
    if (uncachedAddresses.length > 0) {
      newProfiles = await this.fetchProfilesFromAPI(uncachedAddresses)

      // Cache the new profiles
      newProfiles.forEach(profile => {
        this.cache.set(profile.address, Promise.resolve(profile))
      })
    }

    // Combine cached and new profiles in original order
    const result: Profile[] = []
    for (const address of addressesLower) {
      if (cachedProfiles.has(address)) {
        result.push(await cachedProfiles.get(address)!)
      } else {
        const profile = newProfiles.find(p => p.address === address)
        if (profile) {
          result.push(profile)
        }
      }
    }

    return result
  }

  /**
   * Internal method to fetch profiles from the API
   */
  private async fetchProfilesFromAPI(addresses: string[]): Promise<Profile[]> {
    try {
      const response = await fetch(`${this.baseUrl}/lambdas/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: addresses })
      })

      if (!response.ok) {
        console.error('[PeerAPI] Failed to fetch profiles:', response.status)
        return addresses.map(address => this.createEmptyProfile(address))
      }

      const body: { avatars: Avatar[] }[] = await response.json()

      return body[0].avatars.map(avatar => ({
        address: avatar.userId.toLowerCase(),
        name: avatar.name,
        hasClaimedName: avatar.hasClaimedName,
        avatarFace256: avatar.avatar?.snapshots?.face256
      }))
    } catch (error) {
      console.error('[PeerAPI] Error fetching profiles:', error)
      return addresses.map(address => this.createEmptyProfile(address))
    }
  }

  private createEmptyProfile(address: string): Profile {
    return {
      address: address.toLowerCase(),
      hasClaimedName: false
    }
  }

  /**
   * Clear the cache for specific addresses or all
   */
  clearCache(addresses?: string[]) {
    if (addresses) {
      addresses.forEach(address => this.cache.delete(address.toLowerCase()))
    } else {
      this.cache.clear()
    }
  }
}

// Singleton instance
let peerAPIInstance: PeerAPI | null = null

function getPeerAPI(baseUrl?: string): PeerAPI {
  if (!peerAPIInstance) {
    if (!baseUrl) {
      throw new Error('[PeerAPI] Base URL is required for first initialization')
    }
    peerAPIInstance = new PeerAPI(baseUrl)
  }
  return peerAPIInstance
}

function initializePeerAPI(baseUrl: string) {
  peerAPIInstance = new PeerAPI(baseUrl)
  return peerAPIInstance
}

export type { Profile }
export { initializePeerAPI, getPeerAPI }
