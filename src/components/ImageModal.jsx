import { X } from 'lucide-react'
import { useEffect } from 'react'

function ImageModal({ isOpen, onClose, imageUrl, title = '' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Title */}
        {title && (
          <div className="mb-2">
            <p className="text-white text-lg font-semibold">{title}</p>
          </div>
        )}
        
        {/* Image */}
        <img 
          src={imageUrl} 
          alt={title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>
  )
}

export default ImageModal