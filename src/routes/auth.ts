import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { prisma } from '../db/prismaClient'
import { generateToken, hashPassword, auth } from '../utils/auth'

// 认证路由
export const authRoutes = new Elysia()
  .use(cookie())
  .post('/login', async ({ body, setCookie }) => {
    const { email, password } = body as { email: string; password: string }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || user.password !== hashPassword(password)) {
      return new Response('Invalid credentials', { status: 401 })
    }

    // 生成token
    const token = generateToken(user.id)

    // 设置cookie
    setCookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/'
    })

    return { success: true }
  })
  .post('/register', async ({ body }) => {
    const { email, password, username } = body as {
      email: string
      password: string
      username: string
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new Response('Email already exists', { status: 400 })
    }

    // 创建新用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashPassword(password)
      }
    })

    return { success: true }
  })
  .post('/logout', ({ removeCookie }) => {
    removeCookie('auth_token')
    return { success: true }
  })
  .use(auth)
  .get('/me', ({ user }: { user: import('../utils/auth').User }) => {
    return user
  })