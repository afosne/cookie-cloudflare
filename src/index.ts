import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { cors } from 'hono/cors'
import { userRouter } from './routes/user'
import { cookiePoolRouter } from './routes/cookiePool'
import { shareRouter } from './routes/share'
import { errorMiddleware } from './middleware/error'
import { Env } from './models/bindings'
import { logger } from 'hono/logger'

const app = new Hono<{ Bindings: Env }>()
app.use(logger())
app.use('*', cors())
// 错误处理中间件
app.use('*', errorMiddleware)

// JWT 认证中间件
app.use('/api/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  const publicPaths = ['/api/auth/register', '/api/auth/login']
  if (publicPaths.includes(path)) {
    return next()
  }
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET
  })
  return jwtMiddleware(c, next)
})

// 路由
app.route('api/auth', userRouter)
app.route('/api/pools', cookiePoolRouter)
app.route('/api/shares', shareRouter)

export default app

