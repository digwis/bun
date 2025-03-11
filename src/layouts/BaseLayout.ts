import { Navbar } from '../components/Navbar'
import type { User } from '../utils/auth'
import { safeJsonStringify } from '../utils/htmlSanitizer'

interface BaseLayoutProps {
  children: string
  title: string
  user?: User
}

export const BaseLayout = ({ children, title, user = null }: BaseLayoutProps) => {
  const userScript = `window.USER = ${safeJsonStringify(user)};`;

  return /*html*/`
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - 电影网站</title>
      <link href="/css/tailwind.css" rel="stylesheet">
      <script>
        ${userScript}
      </script>
    </head>
    <body class="bg-gray-900 min-h-screen text-white">
      ${Navbar(user)}
      
      <main>
        ${children}
      </main>

      <footer class="bg-gray-800">
        <div class="max-w-7xl mx-auto py-8 px-4 text-center text-gray-400">
          <p>© ${new Date().getFullYear()} 电影网站 | 使用 Bun、Elysia、Tailwind CSS 构建</p>
        </div>
      </footer>
    </body>
    </html>
  `
}
