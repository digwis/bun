import { Elysia } from 'elysia'
import { prisma } from '../db/prismaClient'
import { BaseLayout } from '../layouts/BaseLayout'
import { Hero } from '../components/Hero'
import { MovieCard } from '../components/MovieCard'
import { CollectionCard } from '../components/CollectionCard'
import { BehindSceneCard } from '../components/BehindSceneCard'
import { auth, injectAuthState } from '../utils/auth'

export default new Elysia()
  .use(auth)
  .get('/', async ({ user }: { user: { id: number; username: string; email: string; avatar: string | null } | null }) => {
    // 获取随机电影用于 Hero 展示
    let randomMovie = null
    try {
      // 获取所有电影总数
      const movieCount = await prisma.movie.count()

      if (movieCount > 0) {
        // 随机选择一个偏移量
        const randomSkip = Math.floor(Math.random() * movieCount)
        
        randomMovie = await prisma.movie.findFirst({
          skip: randomSkip
        })
      }
    } catch (error) {
      console.error('获取随机电影失败:', error)
    }

    // 如果没有找到电影，使用默认内容
    if (!randomMovie) {
      randomMovie = {
        id: 0,
        title: '欢迎来到电影世界',
        description: '我们正在为您准备精彩的电影内容，敬请期待！' as string,
        posterUrl: '/images/movie_poster_26.jpg',
        rating: 0,
        ratingCount: 0,
        year: new Date().getFullYear(),
        director: '电影爱好者'
      }
    }

    // 获取最新电影
    const latestMovies = await prisma.movie.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' }
    })

    // 获取热门合集
    const popularCollections = await prisma.collection.findMany({
      take: 4,
      where: { status: 'published' },
      orderBy: { sortOrder: 'asc' },
      include: {
        movies: {
          take: 4,
          include: { movie: true },
          orderBy: { movie: { rating: 'desc' } }
        }
      }
    })

    // 获取热门幕后花絮
    const popularBehindScenes = await prisma.behindScene.findMany({
      take: 3,
      where: { status: 'published' },
      orderBy: { sortOrder: 'asc' },
      include: { movie: true }
    })

    // 构建页面内容
    const content = /*html*/`
      ${Hero({ movie: {
        ...randomMovie,
        description: randomMovie.description || ''
      } })}

      <div class="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <!-- 最新电影 -->
        <section>
          <h2 class="text-2xl font-bold mb-6">最新上映</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            ${latestMovies.map(movie => MovieCard({
              id: movie.id,
              title: movie.title,
              posterUrl: movie.posterUrl,
              year: movie.year,
              director: movie.director
            })).join('')}
          </div>
        </section>

        <!-- 热门合集 -->
        <section>
          <h2 class="text-2xl font-bold mb-6">热门合集</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            ${popularCollections.map(collection => CollectionCard({
              id: collection.id,
              title: collection.title,
              coverUrl: collection.coverUrl,
              description: collection.description || '',
              movieCount: collection.movies.length
            })).join('')}
          </div>
        </section>

        <!-- 热门幕后 -->
        <section>
          <h2 class="text-2xl font-bold mb-6">幕后花絮</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${popularBehindScenes.map(scene => BehindSceneCard({
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
        </section>
      </div>
    `

    return new Response(
      injectAuthState(
        BaseLayout({
          title: '首页',
          children: content,
          user
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
  })
