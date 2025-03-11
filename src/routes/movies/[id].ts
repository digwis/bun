import { Elysia, t } from 'elysia'
import { html } from '@elysiajs/html'
import { prisma } from '../../db/prismaClient'
import { BaseLayout } from '../../layouts/BaseLayout'
import { CommentSection } from '../../components/CommentSection'
import { auth, injectAuthState } from '../../utils/auth'

export default new Elysia()
  .use(html())
  .use(auth)
  .get('/movies/:id', async ({ params, user, html }: { params: { id: string }, user: import('../../utils/auth').User, html: any }) => {
    try {
      const movieId = Number(params.id)
      const movie = await prisma.movie.findUnique({
        where: { id: movieId },
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  username: true,
                  avatar: true
                }
              }
            }
          }
        }
      })

      if (!movie) {
        return new Response('电影不存在', { status: 404 })
      }

      const content = /*html*/`
        <div class="relative">
          <!-- 电影海报背景 -->
          <div class="absolute inset-0 h-[70vh]">
            <div class="absolute inset-0 bg-black">
              <img src="${movie.posterUrl}" alt="${movie.title}" class="w-full h-full object-cover opacity-30">
            </div>
          </div>

          <!-- 电影信息 -->
          <div class="relative max-w-7xl mx-auto px-4">
            <div class="pt-32 pb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- 左侧海报 -->
              <div class="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <img src="${movie.posterUrl}" alt="${movie.title}" class="w-full h-full object-cover">
              </div>

              <!-- 右侧信息 -->
              <div class="md:col-span-2 text-white">
                <h1 class="text-4xl font-bold mb-4">${movie.title}</h1>
                <div class="mb-6">
                  <p class="text-xl mb-2">${movie.year} · ${movie.director}</p>
                  <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                      <span class="text-yellow-400">★</span>
                      <span class="ml-1">${movie.rating.toFixed(1)}</span>
                    </div>
                    <span class="text-gray-400">${movie.ratingCount} 人评分</span>
                  </div>
                </div>
                <div class="space-y-4">
                  <p class="text-gray-300 whitespace-pre-line">${movie.description}</p>
                  ${movie.downloadUrl ? /*html*/`
                    <div class="mt-8">
                      <a href="${movie.downloadUrl}" target="_blank" class="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
                        下载链接 ${movie.downloadCode ? `(提取码: ${movie.downloadCode})` : ''}
                      </a>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="max-w-7xl mx-auto px-4 py-12">
          ${CommentSection({ 
            movieId: movie.id, 
            initialComments: movie.comments.map(comment => ({
              id: comment.id,
              content: comment.content,
              createdAt: comment.createdAt.toISOString(),
              user: comment.user
            }))
          })}
        </div>
      `

      return new Response(
        injectAuthState(
          BaseLayout({
            title: movie.title,
            children: content,
            user: user
          }),
          user
        ),
        {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=31536000',
          },
        }
      )
    } catch (error) {
      console.error('获取电影详情失败:', error)
      return new Response('服务器错误', { status: 500 })
    }
  })
