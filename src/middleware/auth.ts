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

export async function hashPassword(password: string): Promise<string> {
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
  
  export async function comparePasswords(password: string, storedHash: string): Promise<boolean> {
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