import { prisma } from '../db/prismaClient'

async function removeDuplicateMovies() {
  console.log('开始处理重复电影数据...')

  // 获取所有电影的标题和对应的记录
  const movies = await prisma.movie.findMany({
    orderBy: {
      createdAt: 'asc' // 按创建时间升序排序，这样最早的记录会在前面
    }
  })

  // 用于跟踪已经处理过的电影标题
  const processedTitles = new Map<string, number>()
  const duplicateIds: number[] = []

  // 找出重复的电影记录
  for (const movie of movies) {
    if (processedTitles.has(movie.title)) {
      // 如果这个标题已经处理过，说明是重复的
      duplicateIds.push(movie.id)
    } else {
      // 记录这个标题，保留最早的记录
      processedTitles.set(movie.title, movie.id)
    }
  }

  if (duplicateIds.length === 0) {
    console.log('没有找到重复的电影数据')
    return
  }

  // 删除重复的记录
  console.log(`找到 ${duplicateIds.length} 条重复记录，正在删除...`)
  
  await prisma.movie.deleteMany({
    where: {
      id: {
        in: duplicateIds
      }
    }
  })

  console.log('重复数据删除完成')
}

// 执行清理
removeDuplicateMovies()
  .catch(e => {
    console.error('删除重复数据时出错:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
