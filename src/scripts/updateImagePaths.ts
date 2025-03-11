import { prisma } from '../db/prismaClient'

async function updateImagePaths() {
  try {
    // 更新电影海报路径
    const movies = await prisma.movie.findMany()
    for (const movie of movies) {
      if (!movie.posterUrl.startsWith('/images/')) {
        await prisma.movie.update({
          where: { id: movie.id },
          data: {
            posterUrl: `/images/${movie.posterUrl}`
          }
        })
      }
    }
    console.log('✅ Movie poster paths updated')

    // 更新合集封面路径
    const collections = await prisma.collection.findMany()
    for (const collection of collections) {
      if (!collection.coverUrl.startsWith('/images/')) {
        await prisma.collection.update({
          where: { id: collection.id },
          data: {
            coverUrl: `/images/${collection.coverUrl}`
          }
        })
      }
    }
    console.log('✅ Collection cover paths updated')

    // 更新幕后图片路径
    const scenes = await prisma.behindScene.findMany()
    for (const scene of scenes) {
      if (!scene.imageUrl.startsWith('/images/')) {
        await prisma.behindScene.update({
          where: { id: scene.id },
          data: {
            imageUrl: `/images/${scene.imageUrl}`
          }
        })
      }
    }
    console.log('✅ Behind scene image paths updated')

    console.log('✅ All image paths updated successfully')
  } catch (error) {
    console.error('❌ Error updating image paths:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行更新
updateImagePaths()
