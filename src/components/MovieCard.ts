import { getImageUrl, generateSrcSet, generateSizes } from '../utils/imageUrl'

type MovieCardProps = {
  id: number
  title: string
  posterUrl: string
  year: number
  director: string
}

export const MovieCard = ({ id, title, posterUrl, year, director }: MovieCardProps) => {
  const srcSet = generateSrcSet(posterUrl)
  const sizes = generateSizes()
  
  return /*html*/`
  <a href="/movies/${id}" class="group">
    <div class="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-800">
      <img 
        src="${getImageUrl(posterUrl, 'medium')}" 
        srcset="${srcSet}"
        sizes="${sizes}"
        alt="${title}" 
        loading="lazy"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="absolute bottom-0 p-4 text-white">
          <h3 class="text-lg font-bold">${title}</h3>
          <p class="text-sm text-gray-300">${year} · ${director}</p>
        </div>
      </div>
    </div>
  </a>
`
}
