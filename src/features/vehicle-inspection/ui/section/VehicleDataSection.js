"use client"

export default function VehicleDataSection({ data, onChange, brands, models, fuelTypes, vehicleTypes, countries }) {
  const availableModels = data.brand ? models[data.brand] || [] : []

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">DATOS DEL VEHÍCULO</div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-black mb-1">MARCA:</label>
            <select name="brand" value={data.brand} onChange={onChange} className="border p-2 w-full rounded text-black">
              <option value="">Seleccione</option>
              {brands.map((brand, index) => (
                <option key={index} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">MODELO:</label>
            <select name="model" value={data.model} onChange={onChange} className="border p-2 w-full rounded text-black">
              <option value="">Seleccione</option>
              {availableModels.map((model, index) => (
                <option key={index} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">AÑO:</label>
            <input
              type="number"
              name="year"
              value={data.year}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
              min="1900"
              max="2099"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="col-span-1">
            <label className="block text-black mb-1">MOTOR:</label>
            <input
              type="text"
              name="engine"
              value={data.engine}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">CHASIS:</label>
            <input
              type="text"
              name="chassis"
              value={data.chassis}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <label className="block text-black mb-1">CC:</label>
            <input type="text" name="cc" value={data.cc} onChange={onChange} className="border p-2 w-full rounded text-black" />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">PLACA:</label>
            <input
              type="text"
              name="plate"
              value={data.plate}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">PAÍS ORIGEN:</label>
            <select
              name="originCountry"
              value={data.originCountry}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            >
              <option value="">Seleccione</option>
              {countries.map((country, index) => (
                <option key={index} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <label className="block text-black mb-1">USO:</label>
            <input
              type="text"
              name="use"
              value={data.use}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
              placeholder="Particular, Comercial, etc."
            />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">COMBUSTIBLE:</label>
            <select name="fuelType" value={data.fuelType} onChange={onChange} className="border p-2 w-full rounded text-black">
              <option value="">Seleccione</option>
              {fuelTypes.map((fuel, index) => (
                <option key={index} value={fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">KILOMETRAJE:</label>
            <input
              type="number"
              name="mileage"
              value={data.mileage}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <label className="block text-black mb-1">COLOR 1:</label>
            <input
              type="text"
              name="color1"
              value={data.color1}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">COLOR 2:</label>
            <input
              type="text"
              name="color2"
              value={data.color2}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-black mb-1">TIPO:</label>
            <select
              name="vehicleType"
              value={data.vehicleType}
              onChange={onChange}
              className="border p-2 w-full rounded text-black"
            >
              <option value="">Seleccione</option>
              {vehicleTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">TONELAJE:</label>
          <input
            type="text"
            name="tonnage"
            value={data.tonnage}
            onChange={onChange}
            className="border p-2 w-full rounded text-black"
          />
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">NOMBRE PROPIETARIO MATRÍCULA:</label>
          <input
            type="text"
            name="ownerName"
            value={data.ownerName}
            onChange={onChange}
            className="border p-2 w-full rounded text-black"
          />
        </div>
      </div>
    </div>
  )
}
