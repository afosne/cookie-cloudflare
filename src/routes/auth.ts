import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { HTTPException } from 'hono/http-exception'

const router = new Hono()

// 用于密码加密的辅助函数
async function hashPassword(password: string): Promise<string> {
    // 生成随机盐值
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    
    // 将盐值和密码组合
    const combinedData = new Uint8Array(salt.length + passwordData.length)
    combinedData.set(salt)
    combinedData.set(passwordData, salt.length)
    
    // 计算哈希
    const hash = await crypto.subtle.digest('SHA-256', combinedData)
    
    // 将盐值和哈希组合存储
    const result = new Uint8Array(salt.length + hash.byteLength)
    result.set(salt)
    result.set(new Uint8Array(hash), salt.length)
    
    return btoa(String.fromCharCode(...result))
  }
  
  async function comparePasswords(password: string, storedHash: string): Promise<boolean> {
    const hashData = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0))
    const salt = hashData.slice(0, 16)
    const storedHashPart = hashData.slice(16)
    
    const encoder = new TextEncoder()
    const passwordData = encoder.encode(password)
    
    const combinedData = new Uint8Array(salt.length + passwordData.length)
    combinedData.set(salt)
    combinedData.set(passwordData, salt.length)
    
    const newHash = await crypto.subtle.digest('SHA-256', combinedData)
    const newHashArray = new Uint8Array(newHash)
    
    return newHashArray.every((byte, i) => byte === storedHashPart[i])
  }
router.post('/register', async (c) => {
  const { username, password } = await c.req.json()
  
  if (!username || !password) {
    throw new HTTPException(400, { message: '用户或者密码缺失' })
  }

  // 验证用户名长度
  if (username.length < 3 || username.length > 30) {
    throw new HTTPException(400, { message: '用户名必须大于三位或者小于30位' })
  }

  // 验证密码强度
  if (password.length < 6) {
    throw new HTTPException(400, { message: '密码必须大于6位' })
  }
  
  const hashedPassword = await hashPassword(password)
  
  try {
    // 检查用户名是否已存在
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    )
    .bind(username)
    .first()

    if (existingUser) {
      throw new HTTPException(400, { message: '用户名已存在' })
    }

    // 创建新用户
    const result = await c.env.DB.prepare(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)'
    )
    .bind(username, hashedPassword, 'user')
    .run()
    
    if (!result.success) {
      throw new HTTPException(500, { message: '创建用户失败' })
    }
    
    return c.json({ 
      message: 'User registered successfully',
      success: true
    }, 201)
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    console.error('Registration error:', err)
    throw new HTTPException(500, { message: 'Internal server error' })
  }
})

router.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  
  if (!username || !password) {
    throw new HTTPException(400, { message: '用户名或者密码缺失' })
  }

  try {
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ?'
    )
    .bind(username)
    .first()
    
    if (!user || !await comparePasswords(password, user.password)) {
      throw new HTTPException(401, { message: '账户或者密码错误' })
    }
    
    // 创建 JWT token
    const token = await sign({
      id: user.id,
      username: user.username,
      role: user.role
    }, c.env.JWT_SECRET)
    
    return c.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    console.error('Login error:', err)
    throw new HTTPException(500, { message: 'Internal server error' })
  }
})

// 获取当前用户信息
router.get('/me', async (c) => {
  const user = c.get('jwtPayload')
  
  try {
    const userData = await c.env.DB.prepare(
      'SELECT id, username, role, created_at FROM users WHERE id = ?'
    )
    .bind(user.id)
    .first()

    if (!userData) {
      throw new HTTPException(404, { message: '未查询到用户' })
    }

    return c.json(userData)
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    throw new HTTPException(500, { message: 'Internal server error' })
  }
})

// 更改密码
router.put('/password', async (c) => {
  const user = c.get('jwtPayload')
  const { currentPassword, newPassword } = await c.req.json()

  if (!currentPassword || !newPassword) {
    throw new HTTPException(400, { message: '密码或者新密码缺失' })
  }

  if (newPassword.length < 6) {
    throw new HTTPException(400, { message: '新密码必须大于6位' })
  }

  try {
    const userData = await c.env.DB.prepare(
      'SELECT password FROM users WHERE id = ?'
    )
    .bind(user.id)
    .first()

    if (!userData) {
      throw new HTTPException(404, { message: '用户未找到' })
    }

    const isPasswordValid = await comparePasswords(currentPassword, userData.password)
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: '密码错误' })
    }

    const hashedNewPassword = await hashPassword(newPassword)
    
    await c.env.DB.prepare(
      'UPDATE users SET password = ? WHERE id = ?'
    )
    .bind(hashedNewPassword, user.id)
    .run()

    return c.json({ message: '密码更新成功',success: true})
  } catch (err) {
    if (err instanceof HTTPException) {
      throw err
    }
    throw new HTTPException(500, { message: 'Internal server error' })
  }
})

export { router as authRouter }