import { Hono } from 'hono'
import { checkPoolPermission } from '../middleware/pool'

const router = new Hono()

// 添加共享用户
router.post('/users/add', async (c) => {
  const { poolId, userId } = await c.req.json()
  
  const permission = await checkPoolPermission(c, poolId)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }
  console.log('userId==permission.pool.owner_id',userId,permission.pool.owner_id)
//如果是公开的池子，不能共享
  if(permission.pool.is_public){
    return c.json({message: '公开数据不需要共享数据' }, 403)
  }
//不能共享
  if(userId==permission.pool.owner_id){
    return c.json({message: '不能共享给自己' }, 403)
  }
    await c.env.DB.prepare(
      'INSERT INTO shares (pool_id, user_id) VALUES (?, ?)'
    )
    .bind(poolId, userId)
    .run()
    
    return c.json({ message: '创建分享用户成功' },200)
})

// 移除共享用户
router.post('/users/del', async (c) => {
  const { poolId,userId } = await c.req.json()

  const permission = await checkPoolPermission(c, poolId)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }

  await c.env.DB.prepare(
    'DELETE FROM shares WHERE pool_id = ? AND user_id = ?'
  )
  .bind(poolId, userId)
  .run()
  
  return c.json({ message: '删除分享用户成功' },200)
})

// 获取池的共享用户列表
router.post('/users/list', async (c) => {
  const { poolId } = await c.req.json()
  
  const permission = await checkPoolPermission(c, poolId)
  if (!permission.allowed) {
    return c.json({message: '获取权限错误' }, 403)
  }
  const users = await c.env.DB.prepare(
    `SELECT u.id, u.username FROM users u
     INNER JOIN shares s ON u.id = s.user_id
     WHERE s.pool_id = ?`
  )
  .bind(poolId)
  .all()
  
  return c.json(users)
})

export { router as shareRouter }