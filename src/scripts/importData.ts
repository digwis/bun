import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData() {
  try {
    // 读取数据文件
    const rawData = fs.readFileSync(path.join(process.cwd(), 'movie_data', 'data.json'), 'utf-8')
    const data = JSON.parse(rawData)

    // 导入电影数据
    for (const movie of data.movies) {
      // 调整字段名称以匹配 schema
      const movieData = {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        year: movie.year,
        director: movie.director,
        posterUrl: movie.poster_url,
        videoUrl: movie.video_url,
        downloadUrl: movie.download_url,
        downloadCode: movie.download_code,
        rating: 0,
        ratingCount: 0
      }

      await prisma.movie.upsert({
        where: { id: movie.id },
        update: movieData,
        create: movieData
      })
      console.log(`导入电影: ${movie.title}`)
    }

    // 导入合集数据
    for (const collection of data.collections) {
      const collectionData = {
        id: collection.id,
        title: collection.title,
        description: collection.description,
        coverUrl: collection.cover_url,
        sortOrder: 0,
        status: 'published'
      }

      await prisma.collection.upsert({
        where: { id: collection.id },
        update: {
          ...collectionData,
          movies: {
            deleteMany: {},
            create: collection.movies.map((movieId: number, index: number) => ({
              movieId,
              sortOrder: index
            }))
          }
        },
        create: {
          ...collectionData,
          movies: {
            create: collection.movies.map((movieId: number, index: number) => ({
              movieId,
              sortOrder: index
            }))
          }
        }
      })
      console.log(`导入合集: ${collection.title}`)
    }

    // 导入幕后花絮数据
    for (const scene of data.behindScenes) {
      const sceneData = {
        id: scene.id,
        title: scene.title,
        content: scene.content,
        imageUrl: scene.image_url,
        sortOrder: 0,
        status: 'published',
        movieId: scene.movieId
      }

      await prisma.behindScene.upsert({
        where: { id: scene.id },
        update: sceneData,
        create: sceneData
      })
      console.log(`导入幕后花絮: ${scene.title}`)
    }

    // 创建测试用户
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        username: '测试用户',
        // 密码: test123
        password: '$2b$10$vxve2dQD7jKeERmMvM.P7.UWVTO9EZHx2L8LgxT5QLyge.f0FA6BC'
      }
    })
    console.log('创建测试用户:', testUser.username)

    console.log('数据导入完成')
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData()
