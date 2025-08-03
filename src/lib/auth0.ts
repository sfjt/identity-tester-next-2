import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { Redis } from "@upstash/redis"
import { SessionData } from "@auth0/nextjs-auth0/types"

const redis = Redis.fromEnv()

export const auth0 = new Auth0Client({
  sessionStore: {
    async get(id) {
      return await redis.get<SessionData>(id)
    },
    async set(id, sessionData) {
      const { expiresAt } = sessionData.tokenSet
      const { sid } = sessionData.internal
      const { sub } = sessionData.user

      const sidKey = `sid:${sid}`
      const subKey = `sub:${sub}`
      const willExpireIn = expiresAt - Math.floor(Date.now() / 1000)

      const tasks: Promise<void>[] = []
      tasks.push(
        (async () => {
          await redis.sadd(sidKey, id)
          const sidExpInSeconds =
            (await redis.scard(sidKey)) === 1 ? willExpireIn : Math.max(willExpireIn, await redis.ttl(sidKey))
          await redis.expire(sidKey, sidExpInSeconds)
        })().catch((err) => {
          console.error(`Failed to set inverse index for sid: ${sid} -> ${id}\n`, err)
          throw new Error(err)
        }),
      )

      tasks.push(
        (async () => {
          await redis.sadd(subKey, id)
          const subExpInSeconds =
            (await redis.scard(subKey)) === 1 ? willExpireIn : Math.max(willExpireIn, await redis.ttl(subKey))
          await redis.expire(subKey, subExpInSeconds)
        })().catch((err) => {
          console.error(`Failed to set inverse index for sub: ${sub} -> ${id}\n`, err)
          throw err
        }),
      )

      const results = await Promise.allSettled(tasks)
      const failed = results.filter((result) => result.status === "rejected")
      if (failed.length) {
        throw new Error(failed.map((f) => f.reason).join("\n"))
      }

      await redis.set<SessionData>(id, sessionData, { exat: expiresAt })
    },
    async delete(id) {
      await redis.del(id)
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
            })().catch((err) => {
              console.error(`Failed to delete session by sid: ${sid} -> ${id}\n`, err)
              throw new Error(err)
            }),
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
            })().catch((err) => {
              console.error(`Failed to delete session by sub: ${sub} -> ${id}\n`, err)
              throw new Error(err)
            }),
          )
        })
      }

      const results = await Promise.allSettled(tasks)
      const failed = results.filter((result) => result.status === "rejected")
      if (failed.length) {
        new Error(failed.map((f) => f.reason).join("\n"))
      }
    },
  },
})
