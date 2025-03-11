type SearchBoxProps = {
  placeholder?: string
}

export const SearchBox = ({ placeholder = '搜索电影、合集、幕后花絮...' }: SearchBoxProps) => /*html*/`
  <div class="search-container relative">
    <div class="relative">
      <input
        type="search"
        class="search-input w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        placeholder="${placeholder}"
      >
      <span class="absolute left-3 top-2.5 text-gray-400">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </span>
      <div class="loading-indicator absolute right-3 top-2.5 hidden">
        <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
    
    <div class="search-results absolute z-50 mt-2 w-full bg-gray-800 rounded-lg shadow-lg overflow-hidden hidden">
      <div class="max-h-96 overflow-y-auto"></div>
    </div>
  </div>

  <script>
    const initSearch = () => {
      const containers = document.querySelectorAll('.search-container')
      containers.forEach(container => {
        const input = container.querySelector('.search-input')
        const results = container.querySelector('.search-results')
        const loadingIndicator = container.querySelector('.loading-indicator')
        
        let searchTimeout
        let selectedIndex = -1
        let currentResults = { movies: [], collections: [], behindScenes: [] }

        const debounceSearch = (query) => {
          clearTimeout(searchTimeout)
          if (!query.trim()) {
            results.classList.add('hidden')
            return
          }

          searchTimeout = setTimeout(async () => {
            loadingIndicator.classList.remove('hidden')
            try {
              const response = await fetch(\`/api/search?q=\${encodeURIComponent(query.trim())}\`)
              if (response.ok) {
                currentResults = await response.json()
                updateResults()
              }
            } catch (error) {
              console.error('搜索失败:', error)
              currentResults = { movies: [], collections: [], behindScenes: [] }
            } finally {
              loadingIndicator.classList.add('hidden')
            }
          }, 300)
        }

        const updateResults = () => {
          const totalResults = (currentResults.movies?.length || 0) +
                             (currentResults.collections?.length || 0) +
                             (currentResults.behindScenes?.length || 0)

          if (totalResults === 0) {
            results.classList.add('hidden')
            return
          }

          const content = []

          if (currentResults.movies?.length > 0) {
            content.push(\`
              <div class="px-4 py-2">
                <h3 class="text-sm font-medium text-gray-400 mb-2">电影</h3>
                \${currentResults.movies.map((movie, i) => \`
                  <a href="/movies/\${movie.id}" class="block px-4 py-2 hover:bg-gray-700 rounded-lg text-white \${selectedIndex === i ? 'bg-gray-700' : ''}">
                    <div class="flex items-center space-x-3">
                      <img src="\${movie.posterUrl}" alt="\${movie.title}" class="w-10 h-14 object-cover rounded">
                      <div>
                        <div class="font-medium">\${movie.title}</div>
                        <div class="text-sm text-gray-400">\${movie.year} · \${movie.director}</div>
                      </div>
                    </div>
                  </a>
                \`).join('')}
              </div>
            \`)
          }

          if (currentResults.collections?.length > 0) {
            const offset = currentResults.movies.length
            content.push(\`
              <div class="px-4 py-2 border-t border-gray-700">
                <h3 class="text-sm font-medium text-gray-400 mb-2">合集</h3>
                \${currentResults.collections.map((collection, i) => \`
                  <a href="/collections/\${collection.id}" class="block px-4 py-2 hover:bg-gray-700 rounded-lg text-white \${selectedIndex === offset + i ? 'bg-gray-700' : ''}">
                    <div class="flex items-center space-x-3">
                      <img src="\${collection.coverUrl}" alt="\${collection.title}" class="w-12 h-8 object-cover rounded">
                      <div>
                        <div class="font-medium">\${collection.title}</div>
                        <div class="text-sm text-gray-400">\${collection.movieCount} 部电影</div>
                      </div>
                    </div>
                  </a>
                \`).join('')}
              </div>
            \`)
          }

          if (currentResults.behindScenes?.length > 0) {
            const offset = currentResults.movies.length + currentResults.collections.length
            content.push(\`
              <div class="px-4 py-2 border-t border-gray-700">
                <h3 class="text-sm font-medium text-gray-400 mb-2">幕后花絮</h3>
                \${currentResults.behindScenes.map((scene, i) => \`
                  <a href="/behind-scenes/\${scene.id}" class="block px-4 py-2 hover:bg-gray-700 rounded-lg text-white \${selectedIndex === offset + i ? 'bg-gray-700' : ''}">
                    <div class="flex items-center space-x-3">
                      <img src="\${scene.imageUrl}" alt="\${scene.title}" class="w-12 h-8 object-cover rounded">
                      <div>
                        <div class="font-medium">\${scene.title}</div>
                        <div class="text-sm text-gray-400">来自 \${scene.movie.title}</div>
                      </div>
                    </div>
                  </a>
                \`).join('')}
              </div>
            \`)
          }

          results.querySelector('.max-h-96').innerHTML = content.join('')
          results.classList.remove('hidden')
        }

        const clearSearch = () => {
          results.classList.add('hidden')
          input.value = ''
          currentResults = { movies: [], collections: [], behindScenes: [] }
          selectedIndex = -1
        }

        input.addEventListener('input', (e) => {
          debounceSearch(e.target.value)
        })

        // 点击外部关闭结果
        document.addEventListener('click', (e) => {
          if (!container.contains(e.target)) {
            clearSearch()
          }
        })

        // 点击链接时清理
        results.addEventListener('click', (e) => {
          if (e.target.closest('a')) {
            clearSearch()
          }
        })
      })
    }

    // 确保 DOM 加载后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSearch)
    } else {
      initSearch()
    }
  </script>
`
