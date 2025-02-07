import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (err) {
    if (err instanceof HTTPException) {
      return c.json(
        {
          message: err.message,
          status: err.status
        },
        err.status
      )
    }
    
    console.error(err)
    return c.json(
      {
        message: 'Internal Server Error',
        status: 500
      },
      500
    )
  }
}