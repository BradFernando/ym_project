"use client"

import { useState, useEffect } from "react"
import { vehicleBrands, vehicleModels, fuelTypes, vehicleTypes, countries } from "@/shared/constants/vehicleData"
import InsuredDataSection from "./sections/InsuredDataSection"
import VehicleDataSection from "./sections/VehicleDataSection"
import VehicleDescriptionSection from "./sections/VehicleDescriptionSection"
import AccessoriesSection from "./sections/AccessoriesSection"
import DefectivePartsSection from "./sections/DefectivePartsSection"
import InsurabilitySection from "./sections/InsurabilitySection"
import DocumentsSection from "./sections/DocumentsSection"
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
      "PUERTA POSTERIOR (RH)",
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
    const updatedParts = [...formData.defectiveParts]
    if (!updatedParts[index]) {
      updatedParts[index] = { item: "", observations: "" }
    }
    updatedParts[index][field] = value

    setFormData((prev) => ({
      ...prev,
      defectiveParts: updatedParts,
    }))
  }

  const addDefectivePart = () => {
    setFormData((prev) => ({
      ...prev,
      defectiveParts: [...prev.defectiveParts, { item: "", observations: "" }],
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

  // Calculate insurability whenever vehicle description changes
  useEffect(() => {
    if (Object.keys(formData.vehicleDescription).length > 0) {
      const result = calculateInsurability(formData.vehicleDescription)
      setInsurabilityResult(result)
    }
  }, [formData.vehicleDescription])

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-800 text-white text-center py-4">
        <h1 className="text-2xl font-bold">INSPECCIÓN VEHÍCULOS LIVIANOS</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="font-semibold">Caso:</label>
            <input
              type="text"
              name="caseNumber"
              value={formData.insuredData.caseNumber}
              onChange={handleInsuredDataChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="col-span-1">
            <label className="font-semibold">Usuario:</label>
            <input
              type="text"
              name="user"
              value={formData.insuredData.user}
              onChange={handleInsuredDataChange}
              className="border p-2 w-full rounded"
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
        />

        <InsurabilitySection result={insurabilityResult} notes={formData.notes} onNotesChange={handleNotesChange} />

        <DocumentsSection documents={formData.documents} onChange={handleDocumentChange} />
      </div>
    </div>
  )
}
