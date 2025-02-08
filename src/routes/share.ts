import { Hono } from 'hono'

const router = new Hono()

// 添加共享用户
router.post('/:poolId/users', async (c) => {
  const { poolId } = c.req.param()
  const { userId } = await c.req.json()
  
  await c.env.DB.prepare(
    'INSERT INTO shares (pool_id, user_id) VALUES (?, ?)'
  )
  .bind(poolId, userId)
  .run()
  
  return c.json({ message: 'Share added successfully' })
})

// 移除共享用户
router.delete('/:poolId/users/:userId', async (c) => {
  const { poolId, userId } = c.req.param()
  
  await c.env.DB.prepare(
    'DELETE FROM shares WHERE pool_id = ? AND user_id = ?'
  )
  .bind(poolId, userId)
  .run()
  
  return c.json({ message: 'Share removed successfully' })
})

// 获取池的共享用户列表
router.get('/:poolId/users', async (c) => {
  const { poolId } = c.req.param()
  
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