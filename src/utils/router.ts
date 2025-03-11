import { Elysia } from 'elysia'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Auto-registers routes from files in the routes directory
 * @param app - Elysia app instance
 * @returns Elysia app instance with routes registered
 */
export const registerRoutes = async (app: Elysia) => {
  const routesDir = path.join(import.meta.dir, '..', 'routes')
  
  // 递归注册路由函数
  const registerRoutesRecursively = async (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const registrationPromises = []
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.isDirectory()) {
        // 递归处理子目录
        registrationPromises.push(registerRoutesRecursively(fullPath))
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
        // 跳过非路由文件
        if (entry.name.startsWith('.') || entry.name.includes('.test.') || entry.name.includes('.spec.')) {
          continue
        }
        
        // 使用完整的文件路径进行导入
        const absolutePath = path.resolve(fullPath)
        const relativePath = path.relative(routesDir, fullPath)
        const routePath = '/' + relativePath.replace(/\.(js|ts)$/, '').replace(/\/index$/, '')
        
        // 将每个路由的注册过程添加到 Promise 数组中
        registrationPromises.push(
          import(absolutePath)
            .then(module => {
              if (module && module.default instanceof Elysia) {
                app.use(module.default)
                console.log(`已注册路由模块: ${routePath}`)
              } else if (typeof module.default === 'function') {
                app.get(routePath, module.default)
                console.log(`已注册路由处理器: ${routePath}`)
              } else {
                console.warn(`在 ${entry.name} 中未找到有效的导出`)
              }
            })
            .catch(err => {
              console.error(`加载路由 ${entry.name} 失败:`, err)
            })
        )
      }
    }
    
    // 等待所有注册操作完成
    await Promise.all(registrationPromises)
  }
  
  try {
    // 开始递归注册路由并等待完成
    await registerRoutesRecursively(routesDir)
    console.log('所有路由注册完成')
  } catch (err) {
    console.error('注册路由时发生错误:', err)
  }
  
  return app
}
