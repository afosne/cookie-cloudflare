import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export async function requireAdmin(c: Context, next: Next) {
  const user = c.get('jwtPayload')
  if (user.role !== 'admin') {
    throw new HTTPException(403, { message: 'Admin access required' })
  }
  await next()
}

export async function requireOwnerOrAdmin(c: Context, next: Next) {
  const user = c.get('jwtPayload')
  const resourceOwnerId = c.get('resourceOwnerId')
  
  if (user.role !== 'admin' && user.id !== resourceOwnerId) {
    throw new HTTPException(403, { message: 'Unauthorized access' })
  }
  await next()
}