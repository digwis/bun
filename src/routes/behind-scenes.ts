import { Elysia } from 'elysia'
import { prisma } from '../db/prismaClient'
import { BaseLayout } from '../layouts/BaseLayout'
import { BehindSceneCard } from '../components/BehindSceneCard'

export default new Elysia()
  .get('/behind-scenes', async () => {
    // 获取所有已发布的幕后花絮
    const behindScenes = await prisma.behindScene.findMany({
      where: { 
        status: 'published' 
      },
      orderBy: { 
        sortOrder: 'asc' 
      },
      include: {
        movie: true
      }
    })

    const content = /*html*/`
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h1 class="text-3xl font-bold mb-8">幕后花絮</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${behindScenes.map(scene => BehindSceneCard({
            id: scene.id,
            title: scene.title,
            imageUrl: scene.imageUrl,
            content: scene.content,
            movie: {
              title: scene.movie.title,
              posterUrl: scene.movie.posterUrl
            }
          })).join('')}
        </div>
      </div>
    `

    return new Response(
      BaseLayout({
        title: '幕后花絮',
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
