"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

export default function ImageUploadSection({ images, onChange, onAdd, onRemove }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState({})
  const fileInputRefs = useRef([])

  const validateFile = (file) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return 'El archivo debe ser una imagen'
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return 'La imagen no debe superar los 5MB'
    }

    return null
  }

  const handleFileChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file
    const errorMessage = validateFile(file)
    if (errorMessage) {
      setErrors(prev => ({ ...prev, [index]: { file: errorMessage } }))
      e.target.value = '' // Reset file input
      return
    }

    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })

    // Create a temporary URL for the selected file
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Update the image data
    onChange(index, "file", file)
    onChange(index, "previewUrl", url)
  }

  const validateDescription = (description, index) => {
    if (!description || description.trim() === '') {
      setErrors(prev => ({ ...prev, [index]: { ...prev[index], description: 'La descripción es obligatoria' } }))
      return false
    }

    // Clear description error
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors[index]) {
        delete newErrors[index].description
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index]
        }
      }
      return newErrors
    })

    return true
  }

  const handleDescriptionChange = (e, index) => {
    const description = e.target.value
    onChange(index, "description", description)

    // Validate on blur or when description is not empty
    if (e.type === 'blur' || description.trim() !== '') {
      validateDescription(description, index)
    }
  }

  // Drag and drop handlers
  const handleDragEnter = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [index]: true }))
  }

  const handleDragLeave = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [index]: false }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(prev => ({ ...prev, [index]: false }))

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]

      // Use the existing file validation and handling
      const errorMessage = validateFile(file)
      if (errorMessage) {
        setErrors(prev => ({ ...prev, [index]: { file: errorMessage } }))
        return
      }

      // Clear errors
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })

      // Create a temporary URL for the selected file
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Update the image data
      onChange(index, "file", file)
      onChange(index, "previewUrl", url)
    }
  }

  const triggerFileInput = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click()
    }
  }

  // Auto-focus the description field when an image is uploaded
  useEffect(() => {
    images.forEach((image, index) => {
      if (image.previewUrl && !image.description) {
        const textareaElement = document.querySelector(`textarea[data-index="${index}"]`)
        if (textareaElement) {
          textareaElement.focus()
        }
      }
    })
  }, [images])

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">IMÁGENES DEL VEHÍCULO</div>
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4 bg-gray-100 p-2">
          <div className="col-span-4 font-semibold text-black">IMAGEN</div>
          <div className="col-span-8 font-semibold text-black">DESCRIPCIÓN</div>
        </div>

        {images.map((image, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 mt-4 items-center">
            <div className="col-span-4">
              <div className="flex flex-col items-center">
                <div 
                  className={`relative w-full h-40 mb-2 border-2 border-dashed rounded-lg ${
                    dragActive[index] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  } ${errors[index]?.file ? 'border-red-500' : ''} transition-colors duration-200`}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragLeave={(e) => handleDragLeave(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => triggerFileInput(index)}
                >
                  {image.previewUrl ? (
                    <Image
                      src={image.previewUrl}
                      alt={`Imagen ${index + 1}`}
                      fill
                      className="object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {dragActive[index] ? 'Suelta para cargar' : 'Arrastra una imagen o haz clic para seleccionar'}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={el => fileInputRefs.current[index] = el}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  data-index={index}
                  className="hidden"
                />
                {errors[index]?.file && (
                  <p className="text-red-500 text-xs mt-1">{errors[index].file}</p>
                )}
              </div>
            </div>
            <div className="col-span-8">
              <textarea
                value={image.description || ""}
                onChange={(e) => handleDescriptionChange(e, index)}
                onBlur={(e) => handleDescriptionChange(e, index)}
                data-index={index}
                className={`border p-2 w-full rounded text-black h-32 resize-none transition-colors duration-200 ${
                  errors[index]?.description ? 'border-red-500' : 'focus:border-blue-500 focus:ring focus:ring-blue-200'
                }`}
                placeholder="Descripción de la imagen"
              />
              {errors[index]?.description && (
                <p className="text-red-500 text-xs mt-1">{errors[index].description}</p>
              )}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center gap-1 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Eliminar imagen
              </button>
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Agregar imagen</span>
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>
              Formatos permitidos: JPG, PNG, GIF | Tamaño máximo: 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
