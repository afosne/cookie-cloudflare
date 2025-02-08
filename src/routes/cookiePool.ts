import { Hono } from 'hono'

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

// 更新路由处理程序
router.put('/:id', async (c) => {
  const { id } = c.req.param()
  const { name, domain, cookies, isPublic } = await c.req.json()
  
  const permission = await checkPoolPermission(c, id)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }

  await c.env.DB.prepare(
    `UPDATE cookie_pools 
     SET name = ?, domain = ?, cookies = ?, is_public = ?
     WHERE id = ?`
  )
    .bind(name, domain, cookies, isPublic, id)
    .run()

  return c.json({ message: '更新数据成功' })
})

// 删除路由处理程序
router.delete('/:id', async (c) => {
  const { id } = c.req.param()
  
  const permission = await checkPoolPermission(c, id)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }

  await c.env.DB.prepare('DELETE FROM cookie_pools WHERE id = ?')
    .bind(id)
    .run()

  return c.json({ message: 'Pool deleted successfully' })
})

// 添加权限检查的公共方法
async function checkPoolPermission(c: any, poolId: string) {
  // 检查cookie池是否存在
  const pool = await c.env.DB.prepare('SELECT * FROM cookie_pools WHERE id = ?')
    .bind(poolId)
    .first()
  
  if (!pool) {
    return { allowed: false, error: { message: 'cookie 不存在', status: 404 } }
  }

  // 判断是否属于登录用户或者管理员
  const isOwner = pool.owner_id === c.get('jwtPayload').id
  const isAdmin = c.get('jwtPayload').role === 'admin'

  if (!isOwner && !isAdmin) {
    return { allowed: false, error: { message: '无权操作', status: 403 } }
  }

  return { allowed: true, pool }
}

export { router as cookiePoolRouter }