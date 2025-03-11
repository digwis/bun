import { Elysia, t } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { createHash } from 'crypto'
import { sign, verify } from 'jsonwebtoken'
import { prisma } from '../db/prismaClient'

// 用户类型
export type User = {
  id: number
  email: string
  username: string
  avatar: string | null
} | null

// JWT密钥，应该从环境变量读取
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// 密码加密
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// 生成JWT
export function generateToken(userId: number): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// 验证JWT
export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number; exp: number }
    // 检查token是否过期
    if (decoded.exp * 1000 < Date.now()) {
      return null
    }
    return { userId: decoded.userId }
  } catch {
    return null
  }
}

declare module 'elysia' {
  interface ElysiaState {
    user: User
  }
}

// 认证中间件
export const auth = new Elysia()
  .use(cookie())
  .derive(async ({ cookie: { auth_token } }) => {
    // 从cookie获取token
    const token = auth_token?.value
    if (!token) return { user: null }

    // 验证token
    const payload = verifyToken(token)
    if (!payload) return { user: null }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true
      }
    })

    return { user: user || null }
  })

// 认证守卫
export const guard = new Elysia()
  .use(auth)
  .onBeforeHandle(({ user }) => {
    if (!user) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
    }
  })

// 提供登录状态到模板
export function injectAuthState(content: string, user: User): string {
  return content.replace(
    '</head>',
    `<script>window.USER = ${JSON.stringify(user)}</script></head>`
  )
}

// 声明全局类型
declare global {
  interface Window {
    USER: User
  }
}
