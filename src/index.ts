import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { authRouter } from './routes/auth'
import { cookiePoolRouter } from './routes/cookiePool'
import { shareRouter } from './routes/share'
import { errorMiddleware } from './middleware/error'
import { Env } from './models/bindings'


const app = new Hono<{ Bindings: Env }>()

// 错误处理中间件
app.use('*', errorMiddleware)

// JWT 认证中间件
app.use('/api/*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET
  })
  return jwtMiddleware(c, next)
})

// 路由
app.route('/auth', authRouter)
app.route('/api/pools', cookiePoolRouter)
app.route('/api/shares', shareRouter)

export default app

