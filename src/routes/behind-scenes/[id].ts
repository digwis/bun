import { Elysia } from 'elysia'
import { prisma } from '../../db/prismaClient'
import { BaseLayout } from '../../layouts/BaseLayout'
import { MovieCard } from '../../components/MovieCard'

export default new Elysia()
  .get('/behind-scenes/:id', async ({ params: { id } }) => {
    const scene = await prisma.behindScene.findUnique({
      where: { id: Number(id) },
      include: {
        movie: true
      }
    })

    if (!scene) {
      return new Response('Behind scene not found', { status: 404 })
    }

    const content = /*html*/`
      <div class="min-h-screen bg-gray-900">
        <!-- Hero Section -->
        <div class="relative h-[50vh]">
          <div class="absolute inset-0">
            <img 
              src="${scene.imageUrl}" 
              alt="${scene.title}" 
              class="w-full h-full object-cover"
            >
            <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-gray-900/90 to-gray-900"></div>
          </div>
          <div class="relative h-full flex items-center">
            <div class="container mx-auto px-4 pt-20">
              <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">${scene.title}</h1>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="container mx-auto px-4 -mt-20">
          <div class="max-w-4xl">
            <!-- Related Movie Card -->
            <div class="bg-gray-800 rounded-lg p-6 shadow-xl mb-8">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-24 rounded overflow-hidden flex-shrink-0">
                  <img 
                    src="${scene.movie.posterUrl}" 
                    alt="${scene.movie.title}" 
                    class="w-full h-full object-cover"
                  >
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">${scene.movie.title}</h3>
                  <p class="text-gray-400">${scene.movie.year} · ${scene.movie.director}</p>
                </div>
              </div>
            </div>

            <!-- Behind Scenes Content -->
            <div class="bg-gray-800 rounded-lg p-6 shadow-xl mb-8">
              <div class="prose prose-invert max-w-none">
                <p class="whitespace-pre-line text-gray-300">${scene.content}</p>
              </div>
            </div>

            <!-- Scene Image -->
            <div class="rounded-lg overflow-hidden shadow-xl mb-8">
              <img 
                src="${scene.imageUrl}" 
                alt="${scene.title}" 
                class="w-full h-auto"
              >
            </div>

            <!-- Back to Movie Link -->
            <div class="flex justify-start mb-12">
              <a 
                href="/movies/${scene.movie.id}" 
                class="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors text-white"
              >
                查看电影详情
              </a>
            </div>
          </div>
        </div>
      </div>
    `

    return new Response(
      BaseLayout({
        title: scene.title,
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
