import { Hono } from 'hono'
import { checkPoolPermission } from '../middleware/pool'

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

  return c.json({ id: result.leastID, message: '数据创建成功' }, 200)
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

// 更新路由处理程序
router.post('/put', async (c) => {

  const { poolId, name, domain, cookies, isPublic } = await c.req.json()
  
  const permission = await checkPoolPermission(c, poolId)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }

  await c.env.DB.prepare(
    `UPDATE cookie_pools 
     SET name = ?, domain = ?, cookies = ?, is_public = ?
     WHERE id = ?`
  )
    .bind(name, domain, cookies, isPublic, poolId)
    .run()

  return c.json({ message: '更新数据成功' },200)
})

// 删除路由处理程序
router.post('/del', async (c) => {
  const { poolId } = await c.req.json()
  
  const permission = await checkPoolPermission(c, poolId)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }
  //首先删除共享约束
 await c.env.DB.prepare('DELETE FROM shares WHERE pool_id = ?')
    .bind(poolId)
    .run()

  await c.env.DB.prepare('DELETE FROM cookie_pools WHERE id = ?')
    .bind(poolId)
    .run()

  return c.json({ message: '删除数据成功' },200)
})
export { router as cookiePoolRouter }