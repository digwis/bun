type Comment = {
  id: number
  content: string
  createdAt: string
  user: {
    username: string
    avatar?: string | null
  } | null
}

type CommentSectionProps = {
  movieId: number
  initialComments: Comment[]
}

export function CommentSection({ movieId, initialComments = [] }: CommentSectionProps) {
  return /*html*/`
    <div class="max-w-3xl" id="comment-section">
      <h2 class="text-2xl font-bold mb-8">评论</h2>
      
      <!-- 评论表单 -->      
      <div id="comment-section-auth">
        <form id="comment-form" class="mb-12">
          <textarea 
            name="content" 
            rows="4" 
            class="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="写下你的评论..."
            required
          ></textarea>
          <div class="flex justify-between items-center mt-4">
            <button type="submit" class="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors text-white">
              发表评论
            </button>
            <span id="error-message" class="text-red-500 hidden"></span>
          </div>
        </form>
      </div>

      <!-- 评论列表 -->
      <div class="space-y-8" id="comments-container">
        ${renderComments(initialComments)}
      </div>

      <!-- 没有评论时的提示 -->
      <div id="no-comments" class="text-gray-500 text-center py-8 ${initialComments.length > 0 ? 'hidden' : ''}">
        暂无评论，来发表第一条评论吧
      </div>
    </div>

    <script>
      const movieId = ${movieId};
      document.addEventListener('DOMContentLoaded', () => {
        const commentForm = document.getElementById('comment-form')
        const commentsContainer = document.getElementById('comments-container')
        const commentTextarea = commentForm?.querySelector('textarea')
        const errorMessage = document.getElementById('error-message')
        const noComments = document.getElementById('no-comments')

        const showError = (message) => {
          if (errorMessage) {
            errorMessage.textContent = message
            errorMessage.classList.remove('hidden')
            setTimeout(() => {
              errorMessage.classList.add('hidden')
            }, 3000)
          }
        }

        const renderComment = (comment) => /*html*/\`
          <div class="border-b border-gray-700 pb-8">
            <div class="flex items-center mb-4">
              <img 
                src="\${comment.user?.avatar || '/images/default-avatar.png'}" 
                alt="\${comment.user?.username || '匿名用户'}"
                class="w-10 h-10 rounded-full mr-4 object-cover"
              >
              <div>
                <div class="font-medium text-white">\${comment.user?.username || '匿名用户'}</div>
                <div class="text-gray-400 text-sm">
                  \${new Date(comment.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <p class="whitespace-pre-line text-white">\${comment.content}</p>
          </div>
        \`

        const updateCommentList = (comments) => {
          if (commentsContainer && noComments) {
            if (comments.length === 0) {
              commentsContainer.innerHTML = ''
              noComments.classList.remove('hidden')
            } else {
              commentsContainer.innerHTML = comments.map(renderComment).join('')
              noComments.classList.add('hidden')
            }
          }
        }

        // 获取最新评论
        const fetchComments = async () => {
          try {
            const response = await fetch(\`/api/movies/${movieId}/comments\`)
            if (response.ok) {
              const comments = await response.json()
              updateCommentList(comments)
            } else {
              const data = await response.json()
              throw new Error(data.error || '获取评论失败')
            }
          } catch (error) {
            console.error('获取评论失败:', error)
            showError('获取评论失败，请刷新页面重试')
          }
        }

        // 评论表单始终可见
        commentForm?.classList.remove('hidden')

        // 提交评论
        commentForm?.addEventListener('submit', async (e) => {
          e.preventDefault()
          
          const content = commentTextarea?.value.trim()
          if (!content) return

          try {
            const response = await fetch('/api/movies/' + movieId + '/comments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ content })
            })
            
            if (response.ok) {
              // 清空输入框
              if (commentTextarea) commentTextarea.value = ''
              
              // 重新获取评论列表
              await fetchComments()
            } else {
              const data = await response.json()
              if (data.error) {
                throw new Error(data.error)
              } else {
                throw new Error('评论发送失败')
              }
            }
          } catch (error) {
            console.error('提交评论失败:', error)
            showError(error instanceof Error ? error.message : '评论发送失败，请稍后重试')
          }
        })

        // 移除定时刷新功能，改为手动刷新
        const refreshButton = document.createElement('button')
        refreshButton.textContent = '刷新评论'
        refreshButton.className = 'px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors text-white ml-4'
        refreshButton.addEventListener('click', fetchComments)
        commentForm?.querySelector('.flex')?.appendChild(refreshButton)

        // 初始化评论列表
        updateCommentList(${JSON.stringify(initialComments)})
      })
    </script>
  `
}

function renderComments(comments: Comment[]) {
  if (comments.length === 0) return ''

  return comments.map(comment => /*html*/`
    <div class="border-b border-gray-700 pb-8">
      <div class="flex items-center mb-4">
        <img 
          src="${comment.user?.avatar || '/images/default-avatar.png'}" 
          alt="${comment.user?.username || '匿名用户'}"
          class="w-10 h-10 rounded-full mr-4 object-cover"
        >
        <div>
          <div class="font-medium text-white">${comment.user?.username || '匿名用户'}</div>
          <div class="text-gray-400 text-sm">
            ${new Date(comment.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      <p class="whitespace-pre-line text-white">${comment.content}</p>
    </div>
  `).join('')
}
