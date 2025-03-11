import { Elysia } from 'elysia'
import { html } from '@elysiajs/html'
import { registerRoutes } from './src/utils/router'
import { initDatabase } from './src/db/prismaClient'
import { staticFiles } from './src/utils/staticFiles'
import * as fs from 'fs/promises'
import * as path from 'path'

// Set up Tailwind CSS build process using the Tailwind CLI
async function buildTailwindCSS() {
  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname('./src/public/css/tailwind.css'), { recursive: true })
    
    // Run Tailwind CLI to build CSS
    const process = Bun.spawn([
      'bunx', 'tailwindcss', 
      '-i', './src/public/css/styles.css', 
      '-o', './src/public/css/tailwind.css',
      '--minify'
    ])
    
    const output = await new Response(process.stdout).text()
    console.log('✅ Tailwind CSS built successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to build Tailwind CSS:', error)
    return false
  }
}

async function startServer() {
  try {
    // Build Tailwind CSS
    await buildTailwindCSS()
    
    // Initialize database connection
    await initDatabase()
    
    // Create Elysia app
    const app = new Elysia()
      // Add static file support
      .use(staticFiles)
      // Add HTML plugin support
      .use(html())
    
    // Register all routes from the routes directory and wait for completion
    await registerRoutes(app)
    
    // Start the server
    app.listen(3000)
    
    console.log(`🦊 Elysia server is running at ${app.server?.hostname}:${app.server?.port}`)
    
    // Watch for CSS changes and rebuild Tailwind in development
    if (process.env.NODE_ENV !== 'production') {
      const cssDir = './src/public/css'
      console.log('👀 Watching for CSS changes...')
      
      Bun.spawn(['bunx', 'tailwindcss', '-i', './src/public/css/styles.css', '-o', './src/public/css/tailwind.css', '--watch'])
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the application
startServer().catch(console.error)
