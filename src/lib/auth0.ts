import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { Redis } from "@upstash/redis"
import { SessionData } from "@auth0/nextjs-auth0/types"

const redis = Redis.fromEnv()

export const auth0 = new Auth0Client({
  sessionStore: {
    async get(id) {
      try {
        return await redis.get<SessionData>(id)
      } catch (err) {
        console.error(err)
        return null
      }
    },
    async set(id, sessionData) {
      const { expiresAt } = sessionData.tokenSet
      const { sid } = sessionData.internal
      const { sub } = sessionData.user

      await redis.sadd(`sid:${sid}`, id)
      await redis.expire(`sid:${sid}`, expiresAt)

      await redis.sadd(`sub:${sub}`, id)
      await redis.expire(`sub:${sub}`, expiresAt)

      await redis.set<SessionData>(id, sessionData, { exat: expiresAt })
    },
    async delete(id) {
      try {
        await redis.del(id)
      } catch (err) {
        console.error(err)
      }
    },
    async deleteByLogoutToken({ sid, sub }) {
      const tasks: Array<Promise<number>> = []

      if (sid) {
        const sessionIds = await redis.smembers(`sid:${sid}`)
        sessionIds.forEach((id) => {
          tasks.push(redis.del(id))
        })
      }

      if (sub) {
        const sessionIds = await redis.smembers(`sub:${sub}`)
        sessionIds.forEach((id) => {
          tasks.push(redis.del(id))
        })
      }

      const results = await Promise.allSettled(tasks)
      results
        .filter((result) => result.status === "rejected")
        .forEach((result) => {
          console.error(`${result.status}: ${result.reason}`)
        })
    },
  },
})
