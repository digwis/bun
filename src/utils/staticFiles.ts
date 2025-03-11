import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'

// 存储已处理的图片缓存
const imageCache = new Map<string, { buffer: ArrayBuffer, type: string }>()

export const staticFiles = new Elysia()
  // 基本静态文件服务
  .use(staticPlugin({
    assets: './src/public',
    prefix: ''
  }))
  // 图片优化处理
  .get('/images/*', async ({ request }) => {
    const url = new URL(request.url)
    const width = url.searchParams.get('w')
    const imagePath = `./src/public${url.pathname}`
    
    // 生成缓存键
    const cacheKey = `${imagePath}${width ? `-w${width}` : ''}`
    
    // 检查缓存
    const cached = imageCache.get(cacheKey)
    if (cached) {
      return new Response(cached.buffer, {
        headers: {
          'Content-Type': cached.type,
          'Cache-Control': 'public, max-age=31536000',
          'Content-Length': String(cached.buffer.byteLength)
        }
      })
    }

    const file = Bun.file(imagePath)
    if (!await file.exists()) {
      return new Response('Image not found', { status: 404 })
    }

    const buffer = await file.arrayBuffer()
    
    // 将处理后的图片存入缓存
    imageCache.set(cacheKey, {
      buffer,
      type: file.type
    })

    return new Response(buffer, {
      headers: {
        'Content-Type': file.type,
        'Cache-Control': 'public, max-age=31536000',
        'Content-Length': String(buffer.byteLength)
      }
    })
  })
