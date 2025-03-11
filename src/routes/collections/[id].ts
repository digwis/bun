import { Elysia } from 'elysia'
import { prisma } from '../../db/prismaClient'
import { BaseLayout } from '../../layouts/BaseLayout'
import { MovieCard } from '../../components/MovieCard'

export default new Elysia()
  .get('/collections/:id', async ({ params: { id } }) => {
    const collection = await prisma.collection.findUnique({
      where: { id: Number(id) },
      include: {
        movies: {
          include: {
            movie: true
          }
        }
      }
    })

    if (!collection) {
      return new Response('Collection not found', { status: 404 })
    }

    const content = /*html*/`
      <div class="relative">
        <!-- 合集封面背景 -->
        <div class="absolute inset-0 h-[50vh]">
          <div class="absolute inset-0 bg-black">
            <img src="${collection.coverUrl}" alt="${collection.title}" class="w-full h-full object-cover opacity-30">
          </div>
        </div>

        <!-- 合集信息 -->
        <div class="relative max-w-7xl mx-auto px-4">
          <div class="pt-32 pb-12">
            <h1 class="text-4xl font-bold mb-4">${collection.title}</h1>
            ${collection.description ? /*html*/`
              <p class="text-xl text-gray-300 max-w-3xl">${collection.description}</p>
            ` : ''}
            <div class="mt-4 text-gray-400">
              <span>${collection.movies.length} 部电影</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 电影列表 -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          ${collection.movies.map(({ movie }) => MovieCard({
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
        title: collection.title,
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
