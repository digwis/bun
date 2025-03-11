import { Elysia } from 'elysia'
import { prisma } from '../db/prismaClient'
import { BaseLayout } from '../layouts/BaseLayout'
import { MovieCard } from '../components/MovieCard'

export default new Elysia()
  .get('/movies', async ({ query }) => {
    // 获取所有电影，使用 distinct 去重
    const movies = await prisma.movie.findMany({
      distinct: ['id'],
      orderBy: { 
        createdAt: 'desc' 
      }
    })

    const content = /*html*/`
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-3xl font-bold mb-8">全部电影</h1>
        
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          ${movies.map(movie => MovieCard({
            id: movie.id,
            title: movie.title,
            posterUrl: movie.posterUrl,
            year: movie.year,
            director: movie.director
          })).join('')}
        </div>
      </div>
    `

    return new Response(
      BaseLayout({
        title: '全部电影',
        children: content
      }),
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=31536000',
        },
      }
    )
  })
