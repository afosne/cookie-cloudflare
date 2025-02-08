import { Hono } from 'hono'
import { requireAdmin, requireOwnerOrAdmin } from '../middleware/auth'

const router = new Hono()

// 创建新的 cookie 池
router.post('/', async (c) => {
  const user = c.get('jwtPayload')
  const { name, domain, cookies, isPublic } = await c.req.json()

  const result = await c.env.DB.prepare(
    `INSERT INTO cookie_pools (name, domain, cookies, owner_id, is_public)
     VALUES (?, ?, ?, ?, ?)`
  )
  .bind(name, domain, cookies, user.id, isPublic)
  .run()
  
  return c.json({ id: result.leastID, message: 'Pool created successfully' }, 200)
})

// 获取所有可访问的 cookie 池
router.get('/', async (c) => {
  const user = c.get('jwtPayload')
  
  const pools = await c.env.DB.prepare(
    `SELECT cp.* FROM cookie_pools cp
     LEFT JOIN shares s ON cp.id = s.pool_id
     WHERE cp.is_public = 1 
     OR cp.owner_id = ?
     OR s.user_id = ?`
  )
  .bind(user.id, user.id)
  .all()
  
  return c.json(pools)
})

// 更新 cookie 池
router.put('/:id', requireOwnerOrAdmin, async (c) => {
  const { id } = c.req.param()
  const { name, domain, cookies, isPublic } = await c.req.json()
  
  await c.env.DB.prepare(
    `UPDATE cookie_pools 
     SET name = ?, domain = ?, cookies = ?, is_public = ?
     WHERE id = ?`
  )
  .bind(name, domain, cookies, isPublic, id)
  .run()
  
  return c.json({ message: 'Pool updated successfully' })
})

// 删除 cookie 池
router.delete('/:id', requireOwnerOrAdmin, async (c) => {
  const { id } = c.req.param()
  
  await c.env.DB.prepare('DELETE FROM cookie_pools WHERE id = ?')
  .bind(id)
  .run()
  
  return c.json({ message: 'Pool deleted successfully' })
})

export { router as cookiePoolRouter }