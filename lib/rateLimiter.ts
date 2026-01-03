/**
 * Rate limiter for login attempts
 * Prevents brute force attacks by limiting failed login attempts
 */

import { RateLimitConfig } from '@/types/auth'

interface RateLimitStore {
  [key: string]: {
    attempts: number
    firstAttemptTime: number
    lockedUntil?: number
  }
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes
}

class RateLimiter {
  private store: RateLimitStore = {}
  private config: RateLimitConfig

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    // Cleanup old entries every hour
    this.startCleanup()
  }

  private startCleanup(): void {
    if (typeof window === 'undefined') return // Only run on client

    setInterval(() => {
      const now = Date.now()
      Object.keys(this.store).forEach((key) => {
        const entry = this.store[key]
        if (now - entry.firstAttemptTime > this.config.windowMs * 2) {
          delete this.store[key]
        }
      })
    }, 60 * 60 * 1000) // Cleanup every hour
  }

  isLocked(identifier: string): boolean {
    const entry = this.store[identifier]
    if (!entry) return false

    if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
      return true
    }

    if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
      delete this.store[identifier]
      return false
    }

    return false
  }

  getLockoutTimeRemaining(identifier: string): number {
    const entry = this.store[identifier]
    if (!entry || !entry.lockedUntil) return 0

    const remaining = entry.lockedUntil - Date.now()
    return remaining > 0 ? remaining : 0
  }

  recordAttempt(identifier: string): { allowed: boolean; remaining: number } {
    const now = Date.now()
    const entry = this.store[identifier]

    // Check if currently locked
    if (this.isLocked(identifier)) {
      return { allowed: false, remaining: this.getLockoutTimeRemaining(identifier) }
    }

    // Initialize new entry
    if (!entry) {
      this.store[identifier] = {
        attempts: 1,
        firstAttemptTime: now,
      }
      return { allowed: true, remaining: 0 }
    }

    // Check if outside the time window
    if (now - entry.firstAttemptTime > this.config.windowMs) {
      this.store[identifier] = {
        attempts: 1,
        firstAttemptTime: now,
      }
      return { allowed: true, remaining: 0 }
    }

    // Increment attempts
    entry.attempts++

    // Check if limit exceeded
    if (entry.attempts > this.config.maxAttempts) {
      entry.lockedUntil = now + this.config.lockoutMs
      return { allowed: false, remaining: this.config.lockoutMs }
    }

    return { allowed: true, remaining: 0 }
  }

  reset(identifier: string): void {
    delete this.store[identifier]
  }

  resetAll(): void {
    this.store = {}
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

export default RateLimiter
