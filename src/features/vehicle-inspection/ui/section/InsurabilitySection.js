"use client"

export default function InsurabilitySection({ result, notes, onNotesChange, onStatusChange }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">SEGÚN LA VERIFICACIÓN DE ESTE VEHÍCULO ES:</div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onStatusChange("ASEGURABLE")}
            className={`col-span-1 p-4 text-center font-bold rounded cursor-pointer transition-colors duration-200 ${
              result.status === "ASEGURABLE" 
                ? "bg-green-500 text-white hover:bg-green-600" 
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            ASEGURABLE
          </button>
          <button
            type="button"
            onClick={() => onStatusChange("NO ASEGURABLE")}
            className={`col-span-1 p-4 text-center font-bold rounded cursor-pointer transition-colors duration-200 ${
              result.status === "NO ASEGURABLE" 
                ? "bg-red-500 text-white hover:bg-red-600" 
                : "bg-gray-200 text-black hover:bg-gray-300"
            }`}
          >
            NO ASEGURABLE
          </button>
        </div>

        {result.status && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-black font-medium">{result.message}</p>
            <p className="text-black text-sm mt-1">
              Ítems en buen estado: {result.goodItemsCount} de {result.totalItems}
            </p>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-black mb-1">EN CASO DE SER NEGATIVO EXPLIQUE LA RAZÓN:</label>
          <textarea
            value={notes}
            onChange={onNotesChange}
            className="border p-2 w-full rounded h-24 text-black"
            placeholder="Ingrese las razones por las que el vehículo no es asegurable..."
          />
        </div>
      </div>
    </div>
  )
}
