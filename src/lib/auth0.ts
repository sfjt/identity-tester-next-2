import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { Redis } from "@upstash/redis"
import { SessionData } from "@auth0/nextjs-auth0/types"

const redis = Redis.fromEnv()

export const auth0 = new Auth0Client({
  sessionStore: {
    async get(id) {
      return redis.get<SessionData>(id)
    },
    async set(id, sessionData) {
      const { expiresAt } = sessionData.tokenSet
      await redis.set<SessionData>(id, sessionData, { exat: expiresAt })
    },
    async delete(id) {
      await redis.del(id)
    },
  },
})
