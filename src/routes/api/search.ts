import { Elysia, t } from 'elysia'
import { prisma } from '../../db/prismaClient'

export default new Elysia()
  .get('/api/search', async ({ query }) => {
    console.log('收到搜索请求:', query) // 调试日志
    const q = query.q as string

    if (!q?.trim()) {
      console.log('空搜索请求') // 调试日志
      return new Response(JSON.stringify({
        movies: [],
        collections: [],
        behindScenes: []
      }))
    }

    try {
      console.log('开始搜索:', q) // 调试日志
      const [movies, collections, behindScenes] = await Promise.all([
        // 搜索电影
        prisma.movie.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { director: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: 5,
          orderBy: [
            { rating: 'desc' },
            { createdAt: 'desc' }
          ]
        }).then(results => {
          console.log('电影搜索结果:', results.length) // 调试日志
          return results
        }),

        // 搜索合集
        prisma.collection.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } }
            ],
            status: 'published'
          },
          take: 3,
          include: {
            movies: {
              take: 1
            }
          },
          orderBy: { sortOrder: 'asc' }
        }).then(results => {
          console.log('合集搜索结果:', results.length) // 调试日志
          return results
        }),

        // 搜索幕后花絮
        prisma.behindScene.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } }
            ],
            status: 'published'
          },
          take: 3,
          include: {
            movie: {
              select: {
                title: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }).then(results => {
          console.log('幕后花絮搜索结果:', results.length) // 调试日志
          return results
        })
      ])

      const response = {
        movies: movies.map(movie => ({
          id: movie.id,
          title: movie.title,
          posterUrl: movie.posterUrl,
          year: movie.year,
          director: movie.director
        })),
        collections: collections.map(collection => ({
          id: collection.id,
          title: collection.title,
          coverUrl: collection.coverUrl,
          movieCount: collection.movies.length
        })),
        behindScenes: behindScenes.map(scene => ({
          id: scene.id,
          title: scene.title,
          imageUrl: scene.imageUrl,
          movie: {
            title: scene.movie.title
          }
        }))
      }

      console.log('搜索完成，返回结果:', {
        movies: response.movies.length,
        collections: response.collections.length,
        behindScenes: response.behindScenes.length
      }) // 调试日志

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      })

    } catch (error: any) {
      console.error('搜索出错:', error instanceof Error ? error.stack : error) // 增强错误日志
      return new Response(
        JSON.stringify({
          error: '搜索请求失败',
          message: error instanceof Error ? error.message : '未知错误'
        }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
  })
