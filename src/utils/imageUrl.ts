// 图片尺寸配置
const SIZES = {
  thumbnail: 150,
  small: 300,
  medium: 600,
  large: 1200
} as const

type ImageSize = keyof typeof SIZES

/**
 * 生成响应式图片URL
 * @param url 原始图片URL
 * @param size 目标尺寸
 * @returns 处理后的URL
 */
export function getImageUrl(url: string, size: ImageSize = 'medium'): string {
  if (!url) return ''
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http')) return url
  
  // 确保URL以/开头
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  
  // 添加尺寸参数
  return `${normalizedUrl}?w=${SIZES[size]}`
}

/**
 * 生成srcset属性值
 * @param url 原始图片URL
 * @returns srcset字符串
 */
export function generateSrcSet(url: string): string {
  if (!url) return ''
  
  return Object.entries(SIZES)
    .map(([size, width]) => `${getImageUrl(url, size as ImageSize)} ${width}w`)
    .join(', ')
}

/**
 * 生成sizes属性值
 * @returns sizes字符串
 */
export function generateSizes(): string {
  return `
    (max-width: 640px) ${SIZES.small}px,
    (max-width: 1024px) ${SIZES.medium}px,
    ${SIZES.large}px
  `.trim()
}
