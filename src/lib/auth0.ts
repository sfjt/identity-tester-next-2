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

      const sidKey = `sid:${sid}`
      const subKey = `sub:${sub}`
      const willExpireIn = expiresAt - Math.floor(Date.now() / 1000)

      try {
        await redis.sadd(sidKey, id)
        const sidExpInSeconds =
          (await redis.scard(sidKey)) === 1 ? willExpireIn : Math.max(willExpireIn, await redis.ttl(sidKey))
        await redis.expire(sidKey, sidExpInSeconds)

        await redis.sadd(subKey, id)
        const subExpInSeconds =
          (await redis.scard(subKey)) === 1 ? willExpireIn : Math.max(willExpireIn, await redis.ttl(subKey))
        await redis.expire(subKey, subExpInSeconds)

        await redis.set<SessionData>(id, sessionData, { exat: expiresAt })
      } catch (err) {
        console.error(err)
      }
    },
    async delete(id) {
      try {
        await redis.del(id)
      } catch (err) {
        console.error(err)
      }
    },
    async deleteByLogoutToken({ sid, sub }) {
      const tasks: Array<Promise<void>> = []

      if (sid) {
        const sidKey = `sid:${sid}`
        const sessionIds = await redis.smembers(sidKey)
        sessionIds.forEach((id) => {
          tasks.push(
            (async () => {
              await redis.del(id)
              await redis.srem(sidKey, id)
            })(),
          )
        })
      }

      if (sub) {
        const subKey = `sub:${sub}`
        const sessionIds = await redis.smembers(subKey)
        sessionIds.forEach((id) => {
          tasks.push(
            (async () => {
              await redis.del(id)
              await redis.srem(subKey, id)
            })(),
          )
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
