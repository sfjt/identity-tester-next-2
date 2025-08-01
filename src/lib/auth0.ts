import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { Redis } from "@upstash/redis"
import { SessionData } from "@auth0/nextjs-auth0/types"

interface IdsArray {
  ids: Array<string>
  expiresAt: number
}

const redis = Redis.fromEnv()

export const auth0 = new Auth0Client({
  sessionStore: {
    async get(id) {
      try{
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

      const tasks: Array<Promise<IdsArray | SessionData | "OK" | null>> = []

      const idsBySid = await redis.get<IdsArray>(`sid:${sid}`) || {ids: [], expiresAt: 0}
      idsBySid.ids.push(id)
      const sidMaxExp = idsBySid.expiresAt > expiresAt ? idsBySid.expiresAt : expiresAt
      tasks.push(redis.set<IdsArray>(`sid:${id}`, { ids: [...new Set(idsBySid.ids)], expiresAt: sidMaxExp }, { exat: sidMaxExp }))

      const idsBySub = await redis.get<IdsArray>(`sub:${sub}`) || {ids: [], expiresAt: 0}
      idsBySub.ids.push(id)
      const subMaxExp = idsBySub.expiresAt > expiresAt ? idsBySub.expiresAt : expiresAt
      tasks.push(redis.set<IdsArray>(`sub:${sub}`, { ids: [...new Set(idsBySub.ids)], expiresAt: subMaxExp }, { exat: subMaxExp }))

      tasks.push(redis.set<SessionData>(id, sessionData, { exat: expiresAt }))

      const results = await Promise.allSettled(tasks)
      results.filter(result => result.status === "rejected").forEach( result => {
        console.error(`${result.status}: ${result.reason}`)
      })
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
        const idsBySid = await redis.get<IdsArray>(`sid:${sid}`)
        if (idsBySid) {
          idsBySid.ids.forEach(id => {
            tasks.push(redis.del(id))
          })
        }
      }

      if (sub) {
        const idsBySub = await redis.get<IdsArray>(`sub:${sub}`)
        if (idsBySub) {
          idsBySub.ids.forEach(id => {
            tasks.push(redis.del(id))
          })
        }
      }

      const results = await Promise.allSettled(tasks)
      results.filter(result => result.status === "rejected").forEach( result => {
        console.error(`${result.status}: ${result.reason}`)
      })
    },
  },
})
