"use client"

export default function DocumentsSection({ documents, onChange }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-blue-700 text-white p-2 font-semibold">DOCUMENTOS PRESENTADOS:</div>
      <div className="p-4">
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-2">
            <div className="text-black font-semibold">CÉDULA</div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="idCard"
                checked={documents.idCard}
                onChange={(e) => onChange("idCard", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="idCard" className="ml-2 text-black">
                {documents.idCard ? "SI" : "NO"}
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-black font-semibold">MATRÍCULA</div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="registration"
                checked={documents.registration}
                onChange={(e) => onChange("registration", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="registration" className="ml-2 text-black">
                {documents.registration ? "SI" : "NO"}
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-black font-semibold">LICENCIA</div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="license"
                checked={documents.license}
                onChange={(e) => onChange("license", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="license" className="ml-2 text-black">
                {documents.license ? "SI" : "NO"}
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-black font-semibold">CONTRATO COMPRA VENTA</div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="purchaseContract"
                checked={documents.purchaseContract}
                onChange={(e) => onChange("purchaseContract", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="purchaseContract" className="ml-2 text-black">
                {documents.purchaseContract ? "SI" : "NO"}
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-black mb-1">NOTA:</label>
          <textarea className="border p-2 w-full rounded h-16 text-black" placeholder="Notas adicionales..." />
        </div>
      </div>
    </div>
  )
}
