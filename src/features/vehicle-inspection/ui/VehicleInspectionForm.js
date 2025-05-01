"use client"

import { useState, useEffect } from "react"
import { vehicleBrands, vehicleModels, fuelTypes, vehicleTypes, countries } from "@/shared/constants/vehicleData"
import InsuredDataSection from "./section/InsuredDataSection"
import VehicleDataSection from "./section/VehicleDataSection"
import VehicleDescriptionSection from "./section/VehicleDescriptionSection"
import AccessoriesSection from "./section/AccessoriesSection"
import DefectivePartsSection from "./section/DefectivePartsSection"
import InsurabilitySection from "./section/InsurabilitySection"
import DocumentsSection from "./section/DocumentsSection"
import { calculateInsurability } from "@/features/vehicle-inspection/lib/insurabilityCalculator"

export default function VehicleInspectionForm() {
  const [formData, setFormData] = useState({
    insuredData: {
      caseNumber: "",
      user: "",
      inspectionDate: "",
      inspectionTime: "",
      city: "",
      insuredName: "",
      identification: "",
      phone: "",
      email: "",
      coordinates: "",
    },
    vehicleData: {
      brand: "",
      model: "",
      year: "",
      engine: "",
      chassis: "",
      use: "",
      cc: "",
      plate: "",
      originCountry: "",
      fuelType: "",
      color1: "",
      color2: "",
      vehicleType: "",
      mileage: "",
      tonnage: "",
      ownerName: "",
      avaluo: "",
    },
    vehicleDescription: {},
    accessories: [],
    defectiveParts: [],
    documents: {
      idCard: false,
      registration: false,
      license: false,
      purchaseContract: false,
    },
    notes: "",
  })

  const [insurabilityResult, setInsurabilityResult] = useState({
    status: "",
    message: "",
    goodItemsCount: 0,
    totalItems: 47,
  })

  // Initialize vehicle description items with default values
  useEffect(() => {
    const descriptionItems = [
      "ANTENA FIJA",
      "CAPOT",
      "LLANTA EMERGENCIA",
      "NEBLINEROS EN FAROS",
      "KIT ANTI-PINCHAZOS",
      "LIMPIA VIDRIO POST",
      "TAPICERIA MIXTA",
      "TECHO",
      "TECHO PANORAMICO",
      "AIRBAGS",
      "AIRE ACONDICIONADO",
      "ALARMA",
      "EMBLEMA DEL",
      "EMBLEMA POST",
      "CABECERAS",
      "ESPEJOS RETROVISORES LATERALES",
      "ESTRIBOS",
      "ESPEJO RETROVISOR INTERNO",
      "FAROS DELANTEROS",
      "FAROS POSTERIORES",
      "GUARDACHOQUE DEL",
      "GUARDACHOQUE POST",
      "GUARDAFANGOS DEL (LH)",
      "GUARDAFANGOS DEL (RH)",
      "GUARDAFANGOS POST (LH)",
      "GUARDAFANGOS POST (RH)",
      "HERRAMIENTAS",
      "LIMPIA VIDRIOS",
      "LLANTAS",
      "LUCES",
      "MASCARILLA",
      "NEBLINEROS",
      "PARABRISAS DEL",
      "PARABRISAS POST",
      "PARLANTES",
      "PLACAS",
      "PUERTA DELANTERA (LH)",
      "PUERTA DELANTERA (RH)",
      "PUERTA POSTERIOR (LH)",
      "PUERTA POSTERIOR (RH)",
      "RASTREO",
      "COMPUERTA POSTERIOR",
      "RADIO",
      "TABLERO INSTRUMENTOS",
      "PINTURA",
      "CARROCERIA GENERAL",
      "TAPACUBOS PEQUEÑOS",
    ]

    const initialDescriptionState = {}
    descriptionItems.forEach((item) => {
      initialDescriptionState[item] = "N/A"
    })

    setFormData((prev) => ({
      ...prev,
      vehicleDescription: initialDescriptionState,
    }))
  }, [])

  const handleInsuredDataChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      insuredData: {
        ...prev.insuredData,
        [name]: value,
      },
    }))
  }

  const handleVehicleDataChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      vehicleData: {
        ...prev.vehicleData,
        [name]: value,
        // Si se cambia la marca, reiniciamos el modelo
        ...(name === "brand" ? { model: "" } : {}),
      },
    }))
  }

  const handleDescriptionChange = (item, value) => {
    setFormData((prev) => ({
      ...prev,
      vehicleDescription: {
        ...prev.vehicleDescription,
        [item]: value,
      },
    }))
  }

  const handleAccessoryChange = (index, field, value) => {
    const updatedAccessories = [...formData.accessories]
    if (!updatedAccessories[index]) {
      updatedAccessories[index] = { detail: "", value: "" }
    }
    updatedAccessories[index][field] = value

    setFormData((prev) => ({
      ...prev,
      accessories: updatedAccessories,
    }))
  }

  const addAccessory = () => {
    setFormData((prev) => ({
      ...prev,
      accessories: [...prev.accessories, { detail: "", value: "" }],
    }))
  }

  const handleDefectivePartChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedParts = [...prev.defectiveParts]

      if (!updatedParts[index]) {
        // Create a new part with the specified field value
        updatedParts[index] = { item: "", observations: "", [field]: value }
      } else {
        // Create a new object for the part being updated to maintain immutability
        updatedParts[index] = { ...updatedParts[index], [field]: value }
      }

      return {
        ...prev,
        defectiveParts: updatedParts,
      }
    })
  }

  const addDefectivePart = () => {
    // Add a new empty defective part entry
    setFormData((prev) => {
      const newParts = [...prev.defectiveParts, { file: null, previewUrl: null, observations: "" }]
      return {
        ...prev,
        defectiveParts: newParts,
      }
    })
  }

  const removeDefectivePart = (index) => {
    const updatedParts = [...formData.defectiveParts]

    // If there's a preview URL, revoke it to free up memory
    if (updatedParts[index]?.previewUrl) {
      URL.revokeObjectURL(updatedParts[index].previewUrl)
    }

    updatedParts.splice(index, 1)

    setFormData((prev) => ({
      ...prev,
      defectiveParts: updatedParts,
    }))
  }

  const handleDocumentChange = (document, checked) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [document]: checked,
      },
    }))
  }

  const handleNotesChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      notes: e.target.value,
    }))
  }


  // Function to handle manual selection of insurability status
  const handleInsurabilityChange = (status) => {
    // Create appropriate message based on status
    let message = ""
    if (status === "ASEGURABLE") {
      message = "El vehículo ha sido marcado como asegurable manualmente."
    } else {
      message = "El vehículo ha sido marcado como no asegurable manualmente."
    }

    // Update insurability result
    setInsurabilityResult(prev => ({
      ...prev,
      status,
      message
    }))
  }

  // Calculate insurability whenever vehicle description changes
  useEffect(() => {
    if (Object.keys(formData.vehicleDescription).length > 0) {
      const result = calculateInsurability(formData.vehicleDescription)
      setInsurabilityResult(result)
    }
  }, [formData.vehicleDescription])

  return (
    <div className="bg-blue-50 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-800 text-white text-center py-4">
        <h1 className="text-2xl font-bold">GRUPO I VH: FORMULARIO INSPECCIÓN VEHÍCULOS</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-black mb-1">CASO:</label>
            <input
              type="text"
              name="caseNumber"
              value={formData.insuredData.caseNumber}
              onChange={handleInsuredDataChange}
              className="border p-2 w-full rounded text-black bg-white"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">USUARIO:</label>
            <input
              type="text"
              name="user"
              value={formData.insuredData.user}
              onChange={handleInsuredDataChange}
              className="border p-2 w-full rounded text-black bg-white"
            />
          </div>
        </div>

        <InsuredDataSection data={formData.insuredData} onChange={handleInsuredDataChange} />

        <VehicleDataSection
          data={formData.vehicleData}
          onChange={handleVehicleDataChange}
          brands={vehicleBrands}
          models={vehicleModels}
          fuelTypes={fuelTypes}
          vehicleTypes={vehicleTypes}
          countries={countries}
        />

        <VehicleDescriptionSection data={formData.vehicleDescription} onChange={handleDescriptionChange} />

        <AccessoriesSection accessories={formData.accessories} onChange={handleAccessoryChange} onAdd={addAccessory} />

        <DefectivePartsSection
          parts={formData.defectiveParts}
          onChange={handleDefectivePartChange}
          onAdd={addDefectivePart}
          onRemove={removeDefectivePart}
        />

        <InsurabilitySection 
          result={insurabilityResult} 
          notes={formData.notes} 
          onNotesChange={handleNotesChange} 
          onStatusChange={handleInsurabilityChange}
        />

        <DocumentsSection documents={formData.documents} onChange={handleDocumentChange} />

        <div className="mt-8 border rounded-lg overflow-hidden bg-white">
          <div className="bg-blue-700 text-white p-2 font-semibold">FIRMAS DE RESPONSABILIDAD</div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-64 h-32 border-b-2 border-black mb-2"></div>
                <p className="text-black font-medium">FIRMA DEL INSPECTOR</p>
              </div>
              <div className="col-span-1 flex flex-col items-center">
                <div className="w-64 h-32 border-b-2 border-black mb-2"></div>
                <p className="text-black font-medium">FIRMA DEL ASEGURADO</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
