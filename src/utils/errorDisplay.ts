export function showError(message: string, duration = 3000) {
  const errorElement = document.createElement('div')
  errorElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
  errorElement.textContent = message
  document.body.appendChild(errorElement)

  setTimeout(() => {
    errorElement.remove()
  }, duration)
}
