import { getImageUrl, generateSrcSet, generateSizes } from '../utils/imageUrl'

type CollectionCardProps = {
  id: number
  title: string
  coverUrl: string
  description?: string
  movieCount: number
}

export const CollectionCard = ({ id, title, coverUrl, description, movieCount }: CollectionCardProps) => /*html*/`
  <a href="/collections/${id}" class="group bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20">
    <div class="relative aspect-[4/3] overflow-hidden">
      <img 
        src="${getImageUrl(coverUrl, 'medium')}" 
        srcset="${generateSrcSet(coverUrl)}"
        sizes="${generateSizes()}"
        alt="${title}" 
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div class="absolute bottom-0 p-6">
          <h3 class="text-2xl font-bold mb-2 group-hover:text-red-500 transition-colors">${title}</h3>
          <div class="flex items-center text-sm text-gray-300 bg-black/30 px-3 py-1 rounded-full w-fit">
            <span>${movieCount} 部电影</span>
          </div>
        </div>
      </div>
    </div>
    ${description ? `<p class="text-gray-400 line-clamp-2 p-6 pt-4 text-sm">${description}</p>` : ''}
  </a>
`
