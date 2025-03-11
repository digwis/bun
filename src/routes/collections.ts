import { Elysia } from 'elysia'
import { prisma } from '../db/prismaClient'
import { BaseLayout } from '../layouts/BaseLayout'
import { CollectionCard } from '../components/CollectionCard'

export default new Elysia()
  .get('/collections', async () => {
    // 获取所有已发布的合集
    const collections = await prisma.collection.findMany({
      where: { 
        status: 'published' 
      },
      orderBy: { 
        sortOrder: 'asc' 
      },
      include: {
        movies: {
          include: { movie: true }
        }
      }
    })

    const content = /*html*/`
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-3xl font-bold mb-8">电影合集</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          ${collections.map(collection => CollectionCard({
            id: collection.id,
            title: collection.title,
            coverUrl: collection.coverUrl,
            description: collection.description || '',
            movieCount: collection.movies.length
          })).join('')}
        </div>
      </div>
    `

    return new Response(
      BaseLayout({
        title: '电影合集',
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
