/**
 * Calcula la asegurabilidad del vehículo basado en la cantidad de ítems en buen estado
 * @param {Object} vehicleDescription - Objeto con los ítems de descripción del vehículo
 * @returns {Object} - Resultado de la asegurabilidad
 */
export function calculateInsurability(vehicleDescription) {
    const totalItems = Object.keys(vehicleDescription).length
    const goodItemsCount = Object.values(vehicleDescription).filter((value) => value === "B").length
  
    let status = ""
    let message = ""
  
    if (goodItemsCount >= 40) {
      status = "ASEGURABLE"
      message = "El vehículo cumple con los requisitos para ser asegurado."
    } else if (goodItemsCount >= 35 && goodItemsCount <= 39) {
      status = "ASEGURABLE"
      message = "El vehículo es asegurable con condiciones especiales."
    } else {
      status = "NO ASEGURABLE"
      message = "El vehículo no cumple con los requisitos mínimos para ser asegurado."
    }
  
    return {
      status,
      message,
      goodItemsCount,
      totalItems,
    }
  }
  