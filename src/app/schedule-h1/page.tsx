import { getTenant, getScheduleH1Logs } from "@/lib/actions";
import { ShieldCheck, FileText, Printer, AlertTriangle } from "lucide-react";

export default async function ScheduleH1Page() {
  const [tenant, logs] = await Promise.all([
    getTenant(),
    getScheduleH1Logs(),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 pb-24 md:pb-8 print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header & Compliance Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div>
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Maharashtra FDA Compliance Register</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Schedule H1 Drug Register
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Official audit log for antibiotics, psychoactive, and narcotic
              dispensations under Indian Drugs &amp; Cosmetics Act
            </p>
          </div>

          <button
            onClick={undefined}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Register for FDA Audit</span>
          </button>
        </div>

        {/* Store Header for Audit Inspections */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{tenant.name}</h2>
              <p className="text-slate-500">{tenant.address}</p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-600">
              <p>Drug License: {tenant.dlNumber}</p>
              <p>GSTIN: {tenant.gstin}</p>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border-b border-r border-slate-200">
                    Sr.
                  </th>
                  <th className="p-2.5 border-b border-r border-slate-200">
                    Date &amp; Time
                  </th>
                  <th className="p-2.5 border-b border-r border-slate-200">
                    Drug Name &amp; Batch
                  </th>
                  <th className="p-2.5 border-b border-r border-slate-200 text-center">
                    Qty
                  </th>
                  <th className="p-2.5 border-b border-r border-slate-200">
                    Patient Name &amp; Address
                  </th>
                  <th className="p-2.5 border-b border-r border-slate-200">
                    Prescribing Doctor &amp; Reg No
                  </th>
                  <th className="p-2.5 border-b border-slate-200">Bill No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No Schedule H1 dispensations recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 font-mono">
                      <td className="p-2.5 border-r border-slate-200 font-bold text-center">
                        {index + 1}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                        {new Date(log.date).toLocaleDateString("en-IN")}{" "}
                        {new Date(log.date).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900 font-sans">
                          {log.medicineName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Batch: {log.batchNumber}
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-center font-bold">
                        {log.quantity}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <div className="font-semibold text-slate-800 font-sans">
                          {log.patientName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {log.patientAddress || "Kolhapur"}
                          {log.patientPhone && ` • ${log.patientPhone}`}
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <div className="font-semibold text-slate-800 font-sans">
                          {log.doctorName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Reg: {log.doctorRegNo || "MMC/Verified"}
                        </div>
                      </td>
                      <td className="p-2.5 font-bold text-emerald-800">
                        {log.invoiceNumber}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
