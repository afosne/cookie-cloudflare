// 添加权限检查的公共方法
export async function checkPoolPermission(c: any, poolId: string) {
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