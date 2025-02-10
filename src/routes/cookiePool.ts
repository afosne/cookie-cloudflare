import { Hono } from 'hono'
import { checkPoolPermission } from '../middleware/pool'

const router = new Hono()

router.post('/create', async (c) => {
  const user = c.get('jwtPayload')
  const { name, domain, cookies, isPublic } = await c.req.json()

  // 验证必需参数
  if (!name || !domain || !cookies) {
    return c.json({ message: '缺少必需参数' }, 400)
  }

  try {
    // 确保 cookies 是字符串
    const cookiesStr = typeof cookies === 'string' ? cookies : JSON.stringify(cookies)
    
    // 检查用户是否存在
    const userExists = await c.env.DB.prepare('SELECT id FROM users WHERE id = ?')
      .bind(user.id)
      .first()

    if (!userExists) {
      return c.json({ message: '用户不存在' }, 404)
    }

    // 检查是否存在同名记录
    const checkName = await c.env.DB.prepare('SELECT * FROM cookie_pools WHERE name = ?')
      .bind(name)
      .first()

    if (checkName) {
//返回错误信息
      return c.json({ message: '记录已存在' }, 409)
    }

    // 插入新记录
    const result = await c.env.DB.prepare(
      `INSERT INTO cookie_pools (name, domain, cookies, owner_id, is_public)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(name, domain, cookiesStr, user.id, isPublic === true ? 1 : 0)
    .run()

    return c.json({ 
      id: result.lastRowId, 
      message: '数据创建成功' 
    }, 200)

  } catch (error) {
    console.error('数据创建失败:', error)
    return c.json({ 
      message: '创建失败',
      error: error.message 
    }, 500)
  }
})
// 更新路由处理程序部分修改
router.post('/put', async (c) => {
  const { poolId, name, domain, cookies, isPublic } = await c.req.json()
  
  const permission = await checkPoolPermission(c, poolId)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }

  try {
    // 确保 cookies 是字符串
    const cookiesStr = typeof cookies === 'string' ? cookies : JSON.stringify(cookies)

    await c.env.DB.prepare(
      `UPDATE cookie_pools 
       SET name = ?, domain = ?, cookies = ?, is_public = ?
       WHERE id = ?`
    )
    .bind(name, domain, cookiesStr, isPublic ? 1 : 0, poolId)
    .run()

    return c.json({ message: '更新数据成功' }, 200)
  } catch (error) {
    console.error('更新数据失败', error)
    return c.json({ message: '更新失败' }, 500)
  }
})

// 获取该域名下的所有cookie池
router.post('/get', async (c) => {
  const user = c.get('jwtPayload')
  const { domain } = await c.req.json()

  if (!domain) {
    return c.json({ message: '缺少域名参数' }, 400)
  }

  try {
    if (user.role === 'admin') {
      const pools = await c.env.DB.prepare('SELECT * FROM cookie_pools WHERE domain = ?')
        .bind(domain)
        .all()
      return c.json(pools)
    }
  //不查询cookies字段
    const pools = await c.env.DB.prepare(
      `SELECT cp.id,cp.name,cp.domain,cp.owner_id,cp.is_public FROM cookie_pools cp
       LEFT JOIN shares s ON cp.id = s.pool_id
       WHERE (cp.is_public = 1 
       OR cp.owner_id = ?
       OR s.user_id = ?)
       AND cp.domain = ?`
    )
      .bind(user.id, user.id, domain)
      .all()
    return c.json(pools)
  } catch (error) {
    console.error('Get cookie pools error:', error)
    return c.json({ message: '获取失败' }, 500)
  }
})

//更具cookie池id获取cookie池
router.post('/id', async (c) => {
  const { poolId } = await c.req.json()
  const user = c.get('jwtPayload')

  try {
    if (user.role === 'admin') {
      const pools = await c.env.DB.prepare('SELECT * FROM cookie_pools WHERE id = ?')
        .bind(poolId)
        .first()
      return c.json(pools)
    }
    //查询自己或者公共的cookie池 只获取 name domain cookies
    const pools = await c.env.DB.prepare(
      `SELECT cp.name,cp.domain,cp.cookies FROM cookie_pools cp
       LEFT JOIN shares s ON cp.id = s.pool_id
       WHERE (cp.is_public = 1 
       OR cp.owner_id = ?
       OR s.user_id = ?)
       AND cp.id = ?`
    )
      .bind(user.id, user.id, poolId)
      .first()
    return c.json(pools)
  } catch (error) {
    console.error('Get cookie pool error:', error)
    return c.json({ message: '获取失败' }, 500)
  }
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