"use client"

export default function VehicleDescriptionSection({ data, onChange }) {
  // Group items into three columns
  const items = Object.keys(data)
  const itemsPerColumn = Math.ceil(items.length / 3)

  const column1 = items.slice(0, itemsPerColumn)
  const column2 = items.slice(itemsPerColumn, itemsPerColumn * 2)
  const column3 = items.slice(itemsPerColumn * 2)

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">DESCRIPCIÓN DEL VEHÍCULO</div>
      <div className="p-4">
        <div className="grid grid-cols-9 gap-2">
          <div className="col-span-5 text-black font-semibold">DESCRIPCIÓN</div>
          <div className="col-span-4 grid grid-cols-4">
            <div className="flex flex-col items-center">
              <span className="text-black font-semibold mb-2"></span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-black font-semibold mb-2"></span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-black font-semibold mb-2"></span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-black font-semibold mb-2"></span>
            </div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-4">
          <div className="col-span-1">
            {column1.map((item, index) => (
              <ItemRow key={index} item={item} value={data[item]} onChange={(value) => onChange(item, value)} />
            ))}
          </div>

          <div className="col-span-1">
            {column2.map((item, index) => (
              <ItemRow key={index} item={item} value={data[item]} onChange={(value) => onChange(item, value)} />
            ))}
          </div>

          <div className="col-span-1">
            {column3.map((item, index) => (
              <ItemRow key={index} item={item} value={data[item]} onChange={(value) => onChange(item, value)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemRow({ item, value, onChange }) {
  return (
    <div className="grid grid-cols-9 gap-2 py-2 border-b">
      <div className="col-span-5 text-sm text-black">{item}</div>
      <div className="col-span-4 grid grid-cols-4">
        <div className="flex flex-col items-center">
          <span className="text-black font-semibold mb-1 text-xs">B</span>
          <input
            type="radio"
            name={`item-${item}`}
            checked={value === "B"}
            onChange={() => onChange("B")}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-black font-semibold mb-1 text-xs">R</span>
          <input
            type="radio"
            name={`item-${item}`}
            checked={value === "R"}
            onChange={() => onChange("R")}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-black font-semibold mb-1 text-xs">M</span>
          <input
            type="radio"
            name={`item-${item}`}
            checked={value === "M"}
            onChange={() => onChange("M")}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-black font-semibold mb-1 text-xs">N/A</span>
          <input
            type="radio"
            name={`item-${item}`}
            checked={value === "N/A"}
            onChange={() => onChange("N/A")}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
