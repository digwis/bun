import type { User } from '../utils/auth'
import { SearchBox } from './SearchBox'
import { escapeHtml } from '../utils/htmlSanitizer'

const userMenu = (user: { username: string, avatar: string | null }) => /*html*/`
  <div class="relative group">
    <button class="flex items-center space-x-2 text-gray-300 hover:text-white">
      ${user.avatar 
        ? `<img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.username)}" class="w-8 h-8 rounded-full">` 
        : `<div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
            <span class="text-white font-medium">${escapeHtml(user.username[0].toUpperCase())}</span>
          </div>`
      }
      <span>${escapeHtml(user.username)}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <div class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block">
      <a href="/profile" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">个人资料</a>
      <a href="/auth/logout" class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">退出登录</a>
    </div>
  </div>
`

const authButtons = /*html*/`
  <div class="flex items-center space-x-4">
    <a href="/auth/login" class="text-gray-300 hover:text-white">登录</a>
    <a href="/auth/register" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">注册</a>
  </div>
`

export const Navbar = (user: User = null) => /*html*/`
  <nav class="bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8">
          <a href="/" class="text-white text-xl font-bold">电影网站</a>
          <div class="flex items-center space-x-4">
            <a href="/movies" class="text-gray-300 hover:text-white">放映</a>
            <a href="/collections" class="text-gray-300 hover:text-white">合集</a>
            <a href="/behind-scenes" class="text-gray-300 hover:text-white">幕后</a>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="w-80">
            ${SearchBox({})}
          </div>

          ${user ? userMenu(user) : authButtons}
        </div>
      </div>
    </div>
  </nav>
`
