"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

export default function DefectivePartsSection({ parts, onChange, onAdd, onRemove }) {
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3
  const fileInputRefs = useRef([])

  const validateFile = (file) => {
    // Check if file is an image or video
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return 'El archivo debe ser una imagen o video'
    }

    // Check file size (max 10MB for videos, 5MB for images)
    const maxSize = file.type.startsWith('video/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return file.type.startsWith('video/') 
        ? 'El video no debe superar los 10MB' 
        : 'La imagen no debe superar los 5MB'
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

    // Update the part data
    onChange(index, "file", file)
    onChange(index, "previewUrl", url)
  }

  const validateObservations = (observations, index) => {
    if (!observations || observations.trim() === '') {
      setErrors(prev => ({ ...prev, [index]: { ...prev[index], observations: 'La observación es obligatoria' } }))
      return false
    }

    // Clear observations error
    setErrors(prev => {
      const newErrors = { ...prev }
      if (newErrors[index]) {
        delete newErrors[index].observations
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index]
        }
      }
      return newErrors
    })

    return true
  }

  const handleObservationsChange = (e, index) => {
    const observations = e.target.value
    onChange(index, "observations", observations)

    // Validate on blur or when observations is not empty
    if (e.type === 'blur' || observations.trim() !== '') {
      validateObservations(observations, index)
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

      // Update the part data
      onChange(index, "file", file)
      onChange(index, "previewUrl", url)
    }
  }

  const triggerFileInput = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click()
    }
  }

  // Auto-focus the observations field when an image is uploaded
  useEffect(() => {
    parts.forEach((part, index) => {
      if (part.previewUrl && !part.observations) {
        const textareaElement = document.querySelector(`textarea[data-index="${index}"]`)
        if (textareaElement) {
          textareaElement.focus()
        }
      }
    })
  }, [parts])

  // Calculate total pages
  const totalPages = Math.ceil(parts.length / itemsPerPage)

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = parts.slice(indexOfFirstItem, indexOfLastItem)

  // Change page
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  // When parts are added or removed, adjust current page if necessary
  useEffect(() => {
    // If parts were added, navigate to the page containing the new part
    if (parts.length > 0) {
      const newPageNumber = Math.ceil(parts.length / itemsPerPage)
      // Only update if we need to go to a new page or if we're on a page that no longer exists
      if (parts.length % itemsPerPage === 1 || currentPage > newPageNumber) {
        setCurrentPage(newPageNumber)
      }
    } else {
      // If no parts, go to page 1
      setCurrentPage(1)
    }
  }, [parts.length, itemsPerPage])

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">REGISTRO VISUAL</div>
      <div className="p-4">
        <div className="grid grid-cols-12 gap-4 bg-gray-100 p-2">
          <div className="col-span-4 font-semibold text-black">IMAGEN/VIDEO</div>
          <div className="col-span-8 font-semibold text-black">OBSERVACIONES</div>
        </div>

        {currentItems.map((part, index) => {
          // Calculate the actual index in the full array
          const actualIndex = indexOfFirstItem + index
          return (
            <div key={actualIndex} className="grid grid-cols-12 gap-4 mt-4 items-center">
              <div className="col-span-4">
                <div className="flex flex-col items-center">
                  <div 
                    className={`relative w-full h-40 mb-2 border-2 border-dashed rounded-lg ${
                      dragActive[actualIndex] ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } ${errors[actualIndex]?.file ? 'border-red-500' : ''} transition-colors duration-200`}
                    onDragEnter={(e) => handleDragEnter(e, actualIndex)}
                    onDragLeave={(e) => handleDragLeave(e, actualIndex)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, actualIndex)}
                    onClick={() => triggerFileInput(actualIndex)}
                  >
                    {part.previewUrl ? (
                      part.file && part.file.type.startsWith('video/') ? (
                        <video 
                          src={part.previewUrl} 
                          controls 
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Image
                          src={part.previewUrl}
                          alt={`Registro visual ${actualIndex + 1}`}
                          fill
                          className="object-contain rounded-lg"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          {dragActive[actualIndex] ? 'Suelta para cargar' : 'Arrastra una imagen o video o haz clic para seleccionar'}
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={el => fileInputRefs.current[actualIndex] = el}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileChange(e, actualIndex)}
                    data-index={actualIndex}
                    className="hidden"
                  />
                  {errors[actualIndex]?.file && (
                    <p className="text-red-500 text-xs mt-1">{errors[actualIndex].file}</p>
                  )}
                </div>
              </div>
              <div className="col-span-8">
                <textarea
                  value={part.observations || ""}
                  onChange={(e) => handleObservationsChange(e, actualIndex)}
                  onBlur={(e) => handleObservationsChange(e, actualIndex)}
                  data-index={actualIndex}
                  className={`border p-2 w-full rounded text-black h-32 resize-none transition-colors duration-200 ${
                    errors[actualIndex]?.observations ? 'border-red-500' : 'focus:border-blue-500 focus:ring focus:ring-blue-200'
                  }`}
                  placeholder="Detalles de la observación"
                />
                {errors[actualIndex]?.observations && (
                  <p className="text-red-500 text-xs mt-1">{errors[actualIndex].observations}</p>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(actualIndex)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center gap-1 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Eliminar registro
                </button>
              </div>
            </div>
          )
        })}

        {/* Pagination controls */}
        {parts.length > itemsPerPage && (
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Anterior
            </button>

            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>

            <button
              type="button"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <span className="text-xl font-bold">+</span>
          <span>Agregar registro visual</span>
        </button>

      </div>
    </div>
  )
}
