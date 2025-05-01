"use client"

import { useState } from "react"

export default function InsuredDataSection({ data, onChange }) {
  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    switch (name) {
      case "inspectionDate":
        return value ? "" : "La fecha de inspección es requerida"
      case "inspectionTime":
        return value ? "" : "La hora es requerida"
      case "city":
        return value ? "" : "La ciudad es requerida"
      case "insuredName":
        return value ? "" : "El nombre del asegurado es requerido"
      case "identification":
        if (!value) return "La identificación es requerida"
        // Basic validation for identification (could be enhanced)
        if (value.length < 5) return "La identificación debe tener al menos 5 caracteres"
        return ""
      case "phone":
        if (!value) return "El teléfono es requerido"
        // Basic validation for phone numbers
        if (!/^\d{7,15}$/.test(value.replace(/\D/g, ''))) 
          return "Ingrese un número de teléfono válido"
        return ""
      case "email":
        if (!value) return "El correo electrónico es requerido"
        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Ingrese un correo electrónico válido"
        return ""
      case "coordinates":
        // Coordinates are optional
        return ""
      default:
        return ""
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Validate the field
    const errorMessage = validateField(name, value)

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }))

    // Call the parent onChange handler
    onChange(e)
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">DATOS DEL ASEGURADO</div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-black mb-1">FECHA INSPECCIÓN</label>
            <input
              type="date"
              name="inspectionDate"
              value={data.inspectionDate}
              onChange={handleChange}
              className={`border p-2 w-full rounded text-black bg-white ${errors.inspectionDate ? 'border-red-500' : ''}`}
              required
            />
            {errors.inspectionDate && (
              <p className="text-red-500 text-xs mt-1">{errors.inspectionDate}</p>
            )}
          </div>
          <div>
            <label className="block text-black mb-1">HORA</label>
            <input
              type="time"
              name="inspectionTime"
              value={data.inspectionTime}
              onChange={handleChange}
              className={`border p-2 w-full rounded text-black bg-white ${errors.inspectionTime ? 'border-red-500' : ''}`}
              required
            />
            {errors.inspectionTime && (
              <p className="text-red-500 text-xs mt-1">{errors.inspectionTime}</p>
            )}
          </div>
          <div>
            <label className="block text-black mb-1">CIUDAD</label>
            <input
              type="text"
              name="city"
              value={data.city}
              onChange={handleChange}
              className={`border p-2 w-full rounded text-black bg-white ${errors.city ? 'border-red-500' : ''}`}
              required
            />
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">NOMBRE ASEGURADO</label>
          <input
            type="text"
            name="insuredName"
            value={data.insuredName}
            onChange={handleChange}
            className={`border p-2 w-full rounded text-black bg-white ${errors.insuredName ? 'border-red-500' : ''}`}
            required
          />
          {errors.insuredName && (
            <p className="text-red-500 text-xs mt-1">{errors.insuredName}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">C.I./RUC/PASAPORTE</label>
          <input
            type="text"
            name="identification"
            value={data.identification}
            onChange={handleChange}
            className={`border p-2 w-full rounded text-black bg-white ${errors.identification ? 'border-red-500' : ''}`}
            required
          />
          {errors.identification && (
            <p className="text-red-500 text-xs mt-1">{errors.identification}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">TELÉFONO</label>
          <input
            type="tel"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            className={`border p-2 w-full rounded text-black bg-white ${errors.phone ? 'border-red-500' : ''}`}
            required
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">CORREO</label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            className={`border p-2 w-full rounded text-black bg-white ${errors.email ? 'border-red-500' : ''}`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">COORDENADAS</label>
          <input
            type="text"
            name="coordinates"
            value={data.coordinates}
            onChange={handleChange}
            className={`border p-2 w-full rounded text-black bg-white ${errors.coordinates ? 'border-red-500' : ''}`}
          />
          {errors.coordinates && (
            <p className="text-red-500 text-xs mt-1">{errors.coordinates}</p>
          )}
        </div>
      </div>
    </div>
  )
}
