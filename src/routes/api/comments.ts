import { Elysia } from 'elysia'
import { prisma } from '../../db/prismaClient'
import { cookie } from '@elysiajs/cookie'
import { verifyToken } from '../../utils/auth'

export const commentRouter = new Elysia()
  .use(cookie())
  .get('/api/movies/:id/comments', async ({ params: { id }, set }) => {
    try {
      const movieId = Number(id)
      if (isNaN(movieId)) {
        set.status = 400
        return { error: '无效的电影ID' }
      }

      const comments = await prisma.comment.findMany({
        where: { movieId },
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user ?? {
          username: '匿名用户',
          avatar: null
        }
      }))
    } catch (error) {
      console.error('获取评论失败:', error)
      set.status = 500
      return { error: '获取评论失败，请稍后重试' }
    }
  })
  .post('/api/movies/:id/comments', async ({ params: { id }, body, set, cookie: { auth_token } }) => {
    try {
      const movieId = Number(id)
      if (isNaN(movieId)) {
        set.status = 400
        return { error: '无效的电影ID' }
      }

      // @ts-ignore
      const content = body?.content?.trim()
      if (!content) {
        set.status = 400
        return { error: '评论内容不能为空' }
      }

      let userId = undefined
      if (auth_token?.value) {
        try {
          const user = await verifyToken(auth_token.value)
          if (user) {
            userId = user.userId
          }
        } catch (error) {
          console.error('验证用户令牌失败:', error)
        }
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          movieId,
          userId
        },
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        }
      })

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: comment.user || {
          username: '匿名用户',
          avatar: null
        }
      }
    } catch (error) {
      console.error('创建评论失败:', error)
      set.status = 500
      return { error: '创建评论失败，请稍后重试' }
    }
  })

export default commentRouter
