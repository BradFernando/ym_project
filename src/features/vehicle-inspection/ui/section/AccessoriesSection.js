"use client"

export default function AccessoriesSection({ accessories, onChange, onAdd }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">ACCESORIOS EXTRAS</div>
      <div className="p-4">
        <div className="grid grid-cols-8 gap-4 bg-gray-100 p-2">
          <div className="col-span-4 font-semibold text-black">DETALLE</div>
          <div className="col-span-4 font-semibold text-black">VALOR APROXIMADO</div>
        </div>

        {accessories.map((accessory, index) => (
          <div key={index} className="grid grid-cols-8 gap-4 mt-2">
            <div className="col-span-4">
              <input
                type="text"
                value={accessory.detail}
                onChange={(e) => onChange(index, "detail", e.target.value)}
                className="border p-2 w-full rounded text-black"
                placeholder="Nombre del accesorio"
              />
            </div>
            <div className="col-span-4">
              <input
                type="text"
                value={accessory.value}
                onChange={(e) => onChange(index, "value", e.target.value)}
                className="border p-2 w-full rounded text-black"
                placeholder="Valor aproximado"
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={onAdd} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <span className="text-xl">+</span>
          <span>Agregar accesorio</span>
        </button>
      </div>
    </div>
  )
}
