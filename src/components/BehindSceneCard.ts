import { getImageUrl, generateSrcSet, generateSizes } from '../utils/imageUrl'

type BehindSceneCardProps = {
  id: number
  title: string
  imageUrl: string
  content: string
  movie: {
    title: string
    posterUrl: string
  }
}

export const BehindSceneCard = ({ id, title, imageUrl, content, movie }: BehindSceneCardProps) => /*html*/`
  <a href="/behind-scenes/${id}" class="group bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
    <div class="relative aspect-[16/9] overflow-hidden">
      <img 
        src="${getImageUrl(imageUrl, 'medium')}" 
        srcset="${generateSrcSet(imageUrl)}"
        sizes="${generateSizes()}"
        alt="${title}" 
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div class="absolute bottom-0 p-6">
          <h3 class="text-2xl font-bold mb-3 group-hover:text-red-500 transition-colors">${title}</h3>
          <div class="flex items-center text-sm text-gray-300 bg-black/30 px-3 py-2 rounded-full">
            <img 
              src="${getImageUrl(movie.posterUrl, 'thumbnail')}" 
              alt="${movie.title}" 
              loading="lazy"
              class="w-6 h-6 object-cover rounded-full"
            >
            <span class="ml-2">${movie.title}</span>
          </div>
        </div>
      </div>
    </div>
    <p class="text-gray-400 line-clamp-3 p-6 pt-4 text-sm">${content}</p>
  </a>
`
