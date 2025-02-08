import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export async function requireAdmin(c: Context, next: Next) {
  const user = c.get('jwtPayload')
  console.log(user)
  if (user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Admin access required' })
  }
  await next()
}

export async function requireOwnerOrAdmin(c: Context, next: Next) {
  const user = c.get('jwtPayload')
  const resourceOwnerId = c.get('resourceOwnerId')
  console.log(user, resourceOwnerId)
  if (user.role !== 'admin' && user.id !== resourceOwnerId) {
    throw new HTTPException(403, { message: 'Unauthorized access' })

  }
  await next()
}