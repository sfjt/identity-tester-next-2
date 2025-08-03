import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { Redis } from "@upstash/redis"
import { SessionData } from "@auth0/nextjs-auth0/types"

const redis = Redis.fromEnv()

async function upsertInverseIndex(key: string, sessionId: string, willExpireIn: number): Promise<void> {
  const pipeline = redis.pipeline()
  pipeline.sadd(key, sessionId)
  pipeline.scard(key)
  pipeline.ttl(key)

  const [, cardResult, ttlResult] = await pipeline.exec<[number, number, number]>()
  const expInSeconds = cardResult === 1 ? willExpireIn : Math.max(willExpireIn, ttlResult)
  await redis.expire(key, expInSeconds)
}

async function deleteSessionsBatch(sessionIds: string[], indexKey: string): Promise<void> {
  if (sessionIds.length === 0) return

  const pipeline = redis.pipeline()
  sessionIds.forEach((id) => {
    pipeline.del(id)
    pipeline.srem(indexKey, id)
  })
  await pipeline.exec()
}

function handleRedisError(operation: string, context: Record<string, string>) {
  return (err: unknown) => {
    console.error("Redis operation failed\n", {
      operation,
      ...context,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err instanceof Error ? err : new Error(String(err))
  }
}

async function executeTasksWithErrorAggregation(tasks: Promise<void>[]): Promise<void> {
  const results = await Promise.allSettled(tasks)
  const failed = results.filter((result) => result.status === "rejected")
  if (failed.length) {
    throw new Error(failed.map((f) => f.reason?.message || f.reason).join("\n"))
  }
}

export const auth0 = new Auth0Client({
  sessionStore: {
    async get(id) {
      return await redis.get<SessionData>(id)
    },
    async set(id, sessionData) {
      const { expiresAt } = sessionData.tokenSet
      const { sid } = sessionData.internal
      const { sub } = sessionData.user
      const willExpireIn = expiresAt - Math.floor(Date.now() / 1000)

      const tasks = [
        upsertInverseIndex(`sid:${sid}`, id, willExpireIn).catch(
          handleRedisError("set_sid_index", { sid, sessionId: id }),
        ),
        upsertInverseIndex(`sub:${sub}`, id, willExpireIn).catch(
          handleRedisError("set_sub_index", { sub, sessionId: id }),
        ),
      ]

      await executeTasksWithErrorAggregation(tasks)
      await redis.set<SessionData>(id, sessionData, { exat: expiresAt })
    },
    async delete(id) {
      await redis.del(id)
    },
    async deleteByLogoutToken({ sid, sub }) {
      const tasks: Promise<void>[] = []

      if (sid) {
        const sessionIds = await redis.smembers(`sid:${sid}`)
        tasks.push(
          deleteSessionsBatch(sessionIds, `sid:${sid}`).catch(handleRedisError("delete_sessions_by_sid", { sid })),
        )
      }

      if (sub) {
        const sessionIds = await redis.smembers(`sub:${sub}`)
        tasks.push(
          deleteSessionsBatch(sessionIds, `sub:${sub}`).catch(handleRedisError("delete_sessions_by_sub", { sub })),
        )
      }

      await executeTasksWithErrorAggregation(tasks)
    },
  },
})
