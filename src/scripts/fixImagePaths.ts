import { prisma } from '../db/prismaClient'

async function fixImagePaths() {
  try {
    // 修复电影海报路径
    const movies = await prisma.movie.findMany()
    for (const movie of movies) {
      if (movie.posterUrl?.startsWith('images/')) {
        await prisma.movie.update({
          where: { id: movie.id },
          data: {
            posterUrl: `/images/${movie.posterUrl.replace('images/', '')}`
          }
        })
      }
    }
    console.log('✅ Movie poster paths fixed')

    // 修复合集封面路径
    const collections = await prisma.collection.findMany()
    for (const collection of collections) {
      if (collection.coverUrl?.startsWith('images/')) {
        await prisma.collection.update({
          where: { id: collection.id },
          data: {
            coverUrl: `/images/${collection.coverUrl.replace('images/', '')}`
          }
        })
      }
    }
    console.log('✅ Collection cover paths fixed')

    // 修复幕后图片路径
    const scenes = await prisma.behindScene.findMany()
    for (const scene of scenes) {
      if (scene.imageUrl?.startsWith('images/')) {
        await prisma.behindScene.update({
          where: { id: scene.id },
          data: {
            imageUrl: `/images/${scene.imageUrl.replace('images/', '')}`
          }
        })
      }
    }
    console.log('✅ Behind scene image paths fixed')

    console.log('✅ All image paths fixed successfully')
  } catch (error) {
    console.error('❌ Error fixing image paths:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
fixImagePaths()
