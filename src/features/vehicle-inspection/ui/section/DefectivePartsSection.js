"use client"

import { useState, useRef, useEffect } from "react"

// Helper function to resize images before processing
// More efficient implementation with better error handling and memory management
const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    // Only process images, not videos
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Skip resizing for small files (less than 1MB)
    if (file.size < 1024 * 1024) {
      resolve(file);
      return;
    }

    // Use createImageBitmap for better performance when available
    if (typeof createImageBitmap === 'function') {
      const fileReader = new FileReader();

      fileReader.onload = function() {
        // Create a blob from the array buffer
        const blob = new Blob([fileReader.result]);

        // Create an image bitmap from the blob
        createImageBitmap(blob)
          .then(imageBitmap => {
            // Check if resizing is needed
            if (imageBitmap.width <= maxWidth && imageBitmap.height <= maxHeight) {
              resolve(file); // No need to resize
              return;
            }

            // Calculate new dimensions
            let newWidth = imageBitmap.width;
            let newHeight = imageBitmap.height;

            if (imageBitmap.width > maxWidth) {
              newWidth = maxWidth;
              newHeight = (imageBitmap.height * maxWidth) / imageBitmap.width;
            }

            if (newHeight > maxHeight) {
              newHeight = maxHeight;
              newWidth = (imageBitmap.width * maxHeight) / imageBitmap.height;
            }

            // Create an offscreen canvas if available for better performance
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;

            const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
            ctx.imageSmoothingQuality = 'medium'; // Balance between quality and performance
            ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight);

            // Close the bitmap to free memory
            imageBitmap.close();

            // Convert to blob with lower quality for better performance
            canvas.toBlob(
              blob => {
                if (!blob) {
                  console.warn('Canvas to Blob conversion failed, using original file');
                  resolve(file);
                  return;
                }

                // Create a new file from the blob
                const resizedFile = new File([blob], file.name, {
                  type: 'image/jpeg', // Convert to JPEG for better compression
                  lastModified: Date.now()
                });

                // Check if the resized file is actually smaller
                if (resizedFile.size < file.size) {
                  resolve(resizedFile);
                } else {
                  // If the resized file is not smaller, use the original
                  console.log('Resized file is not smaller, using original');
                  resolve(file);
                }
              },
              'image/jpeg', // Convert to JPEG for better compression
              quality
            );
          })
          .catch(error => {
            console.error('Error creating ImageBitmap:', error);
            resolve(file); // Return original file on error
          });
      };

      fileReader.onerror = () => {
        console.error('Error reading file');
        resolve(file); // Return original file on error
      };

      // Read the file as an array buffer for better performance
      fileReader.readAsArrayBuffer(file);
    } else {
      // Fallback to the old method if createImageBitmap is not available
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          // Check if resizing is needed
          if (img.width <= maxWidth && img.height <= maxHeight) {
            resolve(file); // No need to resize
            return;
          }

          // Calculate new dimensions
          let newWidth = img.width;
          let newHeight = img.height;

          if (img.width > maxWidth) {
            newWidth = maxWidth;
            newHeight = (img.height * maxWidth) / img.width;
          }

          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = (img.width * maxHeight) / img.height;
          }

          // Create canvas and resize
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;

          const ctx = canvas.getContext('2d', { alpha: false });
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Convert to blob with lower quality
          canvas.toBlob(
            blob => {
              if (!blob) {
                console.warn('Canvas to Blob conversion failed, using original file');
                resolve(file);
                return;
              }

              // Create a new file from the blob
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              // Check if the resized file is actually smaller
              if (resizedFile.size < file.size) {
                resolve(resizedFile);
              } else {
                console.log('Resized file is not smaller, using original');
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );

          // Clean up to prevent memory leaks
          URL.revokeObjectURL(img.src);
        };

        img.onerror = () => {
          console.error('Error loading image');
          resolve(file); // Return original file on error
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        console.error('Error reading file');
        resolve(file); // Return original file on error
      };
    }
  });
};

export default function DefectivePartsSection({ parts, onChange, onAdd, onRemove }) {
  const [errors, setErrors] = useState({})
  const [dragActive, setDragActive] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [isProcessing, setIsProcessing] = useState({})
  // Global processing state to prevent multiple simultaneous uploads
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false)

  const itemsPerPage = 3
  const fileInputRefs = useRef([])

  // Use a ref to keep track of the current parts array
  const partsRef = useRef(parts)

  // Keep track of processing timeouts to clear them if needed
  const processingTimeoutsRef = useRef({})

  // Keep track of object URLs to revoke them when component unmounts
  const objectUrlsRef = useRef([])

  // Update the ref whenever parts changes
  useEffect(() => {
    partsRef.current = parts
  }, [parts])

  // Global error handler for unhandled errors
  useEffect(() => {
    const handleUnhandledError = () => {
      console.error("Unhandled error detected, clearing all processing states")

      // Clear all processing states
      setIsProcessing({})
      setIsGlobalProcessing(false)

      // Clear all processing timeouts
      Object.values(processingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout)
      })
      processingTimeoutsRef.current = {}
    }

    // Add event listeners for unhandled errors
    window.addEventListener('error', handleUnhandledError)
    window.addEventListener('unhandledrejection', handleUnhandledError)

    return () => {
      // Remove event listeners when component unmounts
      window.removeEventListener('error', handleUnhandledError)
      window.removeEventListener('unhandledrejection', handleUnhandledError)

      // Revoke all object URLs when component unmounts to prevent memory leaks
      partsRef.current.forEach(part => {
        if (part.previewUrl) {
          try {
            URL.revokeObjectURL(part.previewUrl)
          } catch (error) {
            console.error("Error revoking URL:", error)
          }
        }
      })

      // Also revoke any URLs stored in the objectUrlsRef
      objectUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url)
        } catch (error) {
          console.error("Error revoking URL:", error)
        }
      })

      // Clear all processing timeouts
      Object.values(processingTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [])

  const validateFile = (file) => {
    // Check if file is an image or video
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return 'El archivo debe ser una imagen o video'
    }

    // Check file size - 15MB for videos, 5MB for images
    const maxSizeImage = 5 * 1024 * 1024
    const maxSizeVideo = 15 * 1024 * 1024

    if (file.type.startsWith('video/') && file.size > maxSizeVideo) {
      return 'El video no debe superar los 15MB'
    } else if (file.type.startsWith('image/') && file.size > maxSizeImage) {
      return 'La imagen no debe superar los 5MB'
    }

    return null
  }

  // Debounced file processing function to prevent UI from becoming unresponsive
  const handleFileChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return

    // If already processing this index or any file is being processed globally, don't start another process
    if (isProcessing[index] || isGlobalProcessing) {
      console.log("Already processing a file, please wait")
      e.target.value = '' // Reset file input
      return
    }

    // Set both local and global processing states first, before any async operations
    setIsProcessing(prev => ({ ...prev, [index]: true }))
    setIsGlobalProcessing(true)

    // Validate file
    const errorMessage = validateFile(file)
    if (errorMessage) {
      setErrors(prev => ({ ...prev, [index]: { file: errorMessage } }))
      setIsProcessing(prev => {
        const newProcessing = { ...prev }
        delete newProcessing[index]
        return newProcessing
      })
      setIsGlobalProcessing(false)
      e.target.value = '' // Reset file input
      return
    }

    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })

    // Set a timeout to ensure processing state is cleared even if something goes wrong
    const processingTimeout = setTimeout(() => {
      console.log("Processing timeout reached, clearing processing state for index:", index)
      setIsProcessing(prev => {
        const newProcessing = { ...prev }
        delete newProcessing[index]
        return newProcessing
      })
      setIsGlobalProcessing(false)
      setErrors(prev => ({ ...prev, [index]: { file: "El procesamiento ha tardado demasiado tiempo. Por favor, inténtelo de nuevo." } }))

      // Remove from tracking ref
      if (processingTimeoutsRef.current[index]) {
        delete processingTimeoutsRef.current[index]
      }
    }, 10000) // 10 seconds timeout

    // Store timeout in ref for tracking
    processingTimeoutsRef.current[index] = processingTimeout

    // Process the file in a separate function to avoid blocking the UI
    const processFile = async () => {
      try {
        // Check if there's an existing preview URL and revoke it to prevent memory leaks
        if (parts[index]?.previewUrl) {
          try {
            URL.revokeObjectURL(parts[index].previewUrl)
            // Remove from objectUrlsRef if it exists
            objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== parts[index].previewUrl)
          } catch (error) {
            console.error("Error revoking URL:", error)
          }
        }

        // Resize image if it's an image file (not for videos)
        let processedFile = file;
        if (file.type.startsWith('image/')) {
          try {
            processedFile = await resizeImage(file);
            console.log("Image resized successfully");
          } catch (resizeError) {
            console.error("Error resizing image:", resizeError);
            // Continue with original file if resizing fails
          }
        }

        // Create URL with error handling
        let url = null;
        try {
          url = URL.createObjectURL(processedFile);
          // Add to objectUrlsRef for tracking
          objectUrlsRef.current.push(url)
        } catch (urlError) {
          console.error("Error creating object URL:", urlError);
          throw new Error("No se pudo procesar el archivo");
        }

        // Use a single batch update for better performance
        onChange(index, "file", processedFile);
        onChange(index, "previewUrl", url);

        // Add a delay before clearing processing state to ensure UI has time to update
        // This helps prevent the browser from becoming unresponsive
        setTimeout(() => {
          // Clear the timeout
          if (processingTimeoutsRef.current[index]) {
            clearTimeout(processingTimeoutsRef.current[index]);
            delete processingTimeoutsRef.current[index];
          }

          // Clear processing states
          setIsProcessing(prev => {
            const newProcessing = { ...prev };
            delete newProcessing[index];
            return newProcessing;
          });

          // Clear global processing state with a slight delay to prevent race conditions
          setTimeout(() => {
            setIsGlobalProcessing(false);
          }, 50);
        }, 200);

        return true; // Success
      } catch (error) {
        console.error("Error processing file:", error);

        // Set error state
        setErrors(prev => ({ ...prev, [index]: { file: error.message || "Error al procesar el archivo" } }));

        // Clear processing state
        setTimeout(() => {
          // Clear the timeout
          if (processingTimeoutsRef.current[index]) {
            clearTimeout(processingTimeoutsRef.current[index]);
            delete processingTimeoutsRef.current[index];
          }

          setIsProcessing(prev => {
            const newProcessing = { ...prev };
            delete newProcessing[index];
            return newProcessing;
          });

          setIsGlobalProcessing(false);
        }, 100);

        return false; // Failure
      }
    };

    // Use a longer delay (50ms) to give the browser more time to update the UI
    // This helps prevent the page from becoming unresponsive
    setTimeout(() => {
      processFile().catch(error => {
        console.error("Unhandled error in processFile:", error);

        // Ensure processing state is cleared
        if (processingTimeoutsRef.current[index]) {
          clearTimeout(processingTimeoutsRef.current[index]);
          delete processingTimeoutsRef.current[index];
        }

        setIsProcessing(prev => {
          const newProcessing = { ...prev };
          delete newProcessing[index];
          return newProcessing;
        });

        setIsGlobalProcessing(false);
      });
    }, 50);

    // Reset file input to allow selecting the same file again
    e.target.value = '';
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

      // If already processing this index or any file is being processed globally, don't start another process
      if (isProcessing[index] || isGlobalProcessing) {
        console.log("Already processing a file, please wait")
        return
      }

      // Set both local and global processing states first, before any async operations
      setIsProcessing(prev => ({ ...prev, [index]: true }))
      setIsGlobalProcessing(true)

      // Validate file
      const errorMessage = validateFile(file)
      if (errorMessage) {
        setErrors(prev => ({ ...prev, [index]: { file: errorMessage } }))
        setIsProcessing(prev => {
          const newProcessing = { ...prev }
          delete newProcessing[index]
          return newProcessing
        })
        setIsGlobalProcessing(false)
        return
      }

      // Clear errors
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })

      // Set a timeout to ensure processing state is cleared even if something goes wrong
      const processingTimeout = setTimeout(() => {
        console.log("Processing timeout reached, clearing processing state for index:", index)
        setIsProcessing(prev => {
          const newProcessing = { ...prev }
          delete newProcessing[index]
          return newProcessing
        })
        setIsGlobalProcessing(false)
        setErrors(prev => ({ ...prev, [index]: { file: "El procesamiento ha tardado demasiado tiempo. Por favor, inténtelo de nuevo." } }))

        // Remove from tracking ref
        if (processingTimeoutsRef.current[index]) {
          delete processingTimeoutsRef.current[index]
        }
      }, 10000) // 10 seconds timeout

      // Store timeout in ref for tracking
      processingTimeoutsRef.current[index] = processingTimeout

      // Process the file in a separate function to avoid blocking the UI
      const processFile = async () => {
        try {
          // Check if there's an existing preview URL and revoke it to prevent memory leaks
          if (parts[index]?.previewUrl) {
            try {
              URL.revokeObjectURL(parts[index].previewUrl)
              // Remove from objectUrlsRef if it exists
              objectUrlsRef.current = objectUrlsRef.current.filter(url => url !== parts[index].previewUrl)
            } catch (error) {
              console.error("Error revoking URL:", error)
            }
          }

          // Resize image if it's an image file (not for videos)
          let processedFile = file;
          if (file.type.startsWith('image/')) {
            try {
              processedFile = await resizeImage(file);
              console.log("Image resized successfully");
            } catch (resizeError) {
              console.error("Error resizing image:", resizeError);
              // Continue with original file if resizing fails
            }
          }

          // Create URL with error handling
          let url = null;
          try {
            url = URL.createObjectURL(processedFile);
            // Add to objectUrlsRef for tracking
            objectUrlsRef.current.push(url)
          } catch (urlError) {
            console.error("Error creating object URL:", urlError);
            throw new Error("No se pudo procesar el archivo");
          }

          // Use a single batch update for better performance
          onChange(index, "file", processedFile);
          onChange(index, "previewUrl", url);

          // Add a delay before clearing processing state to ensure UI has time to update
          // This helps prevent the browser from becoming unresponsive
          setTimeout(() => {
            // Clear the timeout
            if (processingTimeoutsRef.current[index]) {
              clearTimeout(processingTimeoutsRef.current[index]);
              delete processingTimeoutsRef.current[index];
            }

            // Clear processing states
            setIsProcessing(prev => {
              const newProcessing = { ...prev };
              delete newProcessing[index];
              return newProcessing;
            });

            // Clear global processing state with a slight delay to prevent race conditions
            setTimeout(() => {
              setIsGlobalProcessing(false);
            }, 50);
          }, 200);

          return true; // Success
        } catch (error) {
          console.error("Error processing file:", error);

          // Set error state
          setErrors(prev => ({ ...prev, [index]: { file: error.message || "Error al procesar el archivo" } }));

          // Clear processing state
          setTimeout(() => {
            // Clear the timeout
            if (processingTimeoutsRef.current[index]) {
              clearTimeout(processingTimeoutsRef.current[index]);
              delete processingTimeoutsRef.current[index];
            }

            setIsProcessing(prev => {
              const newProcessing = { ...prev };
              delete newProcessing[index];
              return newProcessing;
            });

            setIsGlobalProcessing(false);
          }, 100);

          return false; // Failure
        }
      };

      // Use a longer delay (50ms) to give the browser more time to update the UI
      // This helps prevent the page from becoming unresponsive
      setTimeout(() => {
        processFile().catch(error => {
          console.error("Unhandled error in processFile:", error);

          // Ensure processing state is cleared
          if (processingTimeoutsRef.current[index]) {
            clearTimeout(processingTimeoutsRef.current[index]);
            delete processingTimeoutsRef.current[index];
          }

          setIsProcessing(prev => {
            const newProcessing = { ...prev };
            delete newProcessing[index];
            return newProcessing;
          });

          setIsGlobalProcessing(false);
        });
      }, 50);
    }
  }

  const triggerFileInput = (index) => {
    // Don't trigger file input if already processing this index or any file is being processed globally
    if (isProcessing[index] || isGlobalProcessing) {
      console.log("Already processing a file, please wait")
      return
    }

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
                      isProcessing[actualIndex] || isGlobalProcessing
                        ? 'border-blue-300 bg-blue-50 cursor-wait' 
                        : dragActive[actualIndex] 
                          ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    } ${errors[actualIndex]?.file ? 'border-red-500' : ''} transition-colors duration-200`}
                    onDragEnter={(e) => !(isProcessing[actualIndex] || isGlobalProcessing) && handleDragEnter(e, actualIndex)}
                    onDragLeave={(e) => !(isProcessing[actualIndex] || isGlobalProcessing) && handleDragLeave(e, actualIndex)}
                    onDragOver={(e) => !(isProcessing[actualIndex] || isGlobalProcessing) && handleDragOver(e)}
                    onDrop={(e) => !(isProcessing[actualIndex] || isGlobalProcessing) && handleDrop(e, actualIndex)}
                    onClick={() => triggerFileInput(actualIndex)}
                  >
                    {isProcessing[actualIndex] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-blue-500">Procesando...</p>
                      </div>
                    ) : part.previewUrl ? (
                      part.file && part.file.type.startsWith('video/') ? (
                        // Simple video placeholder to avoid loading the actual video until clicked
                        <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-lg">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p className="mt-2 text-xs text-white">Video cargado (clic para reproducir)</p>
                          <a 
                            href={part.previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-1 text-xs text-blue-300 underline"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering file input
                            }}
                          >
                            Abrir video
                          </a>
                        </div>
                      ) : (
                        // Simple image preview with minimal attributes
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={part.previewUrl}
                            alt={`Imagen ${actualIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          {dragActive[actualIndex] ? 'Suelte para cargar' : 'Clic para seleccionar archivo'}
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
