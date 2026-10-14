import { getSuppliers } from "@/lib/actions";
import { Truck, Phone, Mail, MapPin, ShieldCheck, Boxes } from "lucide-react";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="h-6 w-6 text-teal-600" />
            <span>Pharma Distributors &amp; Stockists (Kolhapur)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Registered wholesale pharmaceutical suppliers and stockist accounts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {sup.name}
                    </h2>
                    {sup.contactPerson && (
                      <p className="text-xs text-slate-600">
                        Contact: {sup.contactPerson}
                      </p>
                    )}
                  </div>
                  <span className="rounded-lg bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                    Wholesale
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{sup.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{sup.phone}</span>
                  </div>
                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{sup.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 font-mono text-[11px] text-slate-500">
                  {sup.dlNumber && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>DL: {sup.dlNumber}</span>
                    </div>
                  )}
                  {sup.gstin && <div>GSTIN: {sup.gstin}</div>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Boxes className="h-3.5 w-3.5 text-teal-600" />
                  <span>{sup.batches.length} Active Batches Supplied</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
