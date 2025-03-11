/**
 * HTML转义
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 安全地将数据序列化为JSON并转义HTML
 */
export const safeJsonStringify = (data: any): string => {
  return escapeHtml(JSON.stringify(data))
    .replace(/\//g, '\\/')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * HTML内容构建器
 */
export const html = (strings: TemplateStringsArray, ...values: any[]): string => {
  return strings.reduce((result, str, i) => {
    const value = values[i];
    // 如果值不存在，返回空字符串
    if (value === undefined || value === null) {
      return result + str;
    }
    // 如果值是数组，递归处理每个元素
    if (Array.isArray(value)) {
      return result + str + value.map(v => typeof v === 'string' ? escapeHtml(v) : v).join('');
    }
    // 如果值是预处理的HTML（如其他组件返回的HTML），直接使用
    if (typeof value === 'object' && value.__html) {
      return result + str + value.__html;
    }
    // 其他情况，转义字符串
    return result + str + (typeof value === 'string' ? escapeHtml(value) : value);
  }, '');
}

/**
 * 创建安全的HTML内容
 */
export const createSafeHtml = (content: string) => ({
  __html: content
});
