import { Elysia } from 'elysia'

import type { ErrorHandler } from 'elysia'

export const errorHandler = new Elysia()
  .onError(({ code, error, request, set }) => {
    const timestamp = new Date().toISOString()

    // 检查是否为API请求
    const isApiRequest = request.url.includes('/api/')
    
    // 记录错误
    console.error(`[${timestamp}] Error:`, { code, error, url: request.url })
    
    if (isApiRequest) {
      set.status = code === 'NOT_FOUND' ? 404 : 500
      return {
        error: String(error),
        code,
        timestamp
      }
    }

    // 根据错误类型返回适当的响应
    if (code === 'NOT_FOUND') {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>404 - 页面未找到</title>
            <style>
              body { font-family: system-ui; padding: 2rem; max-width: 60ch; margin: 0 auto; }
              .error-code { font-size: 8rem; font-weight: bold; margin: 0; color: #ef4444; }
              .error-message { font-size: 1.5rem; color: #374151; margin-bottom: 2rem; }
              .error-details { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; }
              .back-link { display: inline-block; margin-top: 1rem; color: #ef4444; text-decoration: none; }
              .back-link:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <h1 class="error-code">404</h1>
            <p class="error-message">抱歉，页面未找到</p>
            <div class="error-details">
              <p>请求的 URL: ${request.url}</p>
              <p>时间: ${timestamp}</p>
            </div>
            <a href="/" class="back-link">返回首页</a>
          </body>
        </html>`,
        {
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8'
          }
        }
      )
    }

    // 其他错误返回 500
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>500 - 服务器错误</title>
          <style>
            body { font-family: system-ui; padding: 2rem; max-width: 60ch; margin: 0 auto; }
            .error-code { font-size: 8rem; font-weight: bold; margin: 0; color: #ef4444; }
            .error-message { font-size: 1.5rem; color: #374151; margin-bottom: 2rem; }
            .error-details { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; }
            .back-link { display: inline-block; margin-top: 1rem; color: #ef4444; text-decoration: none; }
            .back-link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1 class="error-code">500</h1>
          <p class="error-message">抱歉，服务器出现错误</p>
          <div class="error-details">
            <p>错误信息: ${error.message}</p>
            <p>时间: ${timestamp}</p>
          </div>
          <a href="/" class="back-link">返回首页</a>
        </body>
      </html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    )
  })