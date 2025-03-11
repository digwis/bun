import { getImageUrl, generateSrcSet, generateSizes } from '../utils/imageUrl'

interface HeroProps {
  movie: {
    id: number
    title: string
    description: string
    posterUrl: string
    rating: number
    ratingCount: number
    year: number
    director: string
  }
}

export const Hero = ({ movie }: HeroProps) => /*html*/`
  <div class="relative bg-gray-900">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
      <img 
        src="${getImageUrl(movie.posterUrl, 'large')}" 
        srcset="${generateSrcSet(movie.posterUrl)}"
        sizes="100vw"
        alt="${movie.title}" 
        class="w-full h-full object-cover opacity-30"
      >
    </div>
    
    <div class="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-4">
        ${movie.title}
      </h1>
      <div class="flex items-center space-x-4 mb-6">
        <p class="text-xl text-gray-300">${movie.year} · ${movie.director}</p>
        <div class="flex items-center text-yellow-400">
          <span class="text-2xl">★</span>
          <span class="ml-1 text-xl">${movie.rating.toFixed(1)}</span>
        </div>
        <span class="text-gray-400">${movie.ratingCount} 人评分</span>
      </div>
      <p class="text-xl text-gray-300 max-w-3xl line-clamp-3">
        ${movie.description}
      </p>
      <a href="/movies/${movie.id}" class="inline-block mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
        查看详情
      </a>
    </div>
  </div>
`
