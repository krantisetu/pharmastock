"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  RotateCcw,
  Boxes,
  Truck,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { getExpiryAlerts } from "@/lib/actions";

export default function ExpiryAlertsPage() {
  const [data, setData] = useState<{
    expired: any[];
    critical: any[];
    warning: any[];
  }>({ expired: [], critical: [], warning: [] });
  const [activeTab, setActiveTab] = useState<"critical" | "warning" | "expired">(
    "critical"
  );

  useEffect(() => {
    async function load() {
      const res = await getExpiryAlerts();
      setData(res);
    }
    load();
  }, []);

  const currentList =
    activeTab === "critical"
      ? data.critical
      : activeTab === "warning"
      ? data.warning
      : data.expired;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-amber-500" />
            <span>Expiry Date Monitor & Deadstock Prevention</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track batches nearing expiry (FEFO) and initiate distributor returns
            before loss occurs
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab("critical")}
            className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all ${
              activeTab === "critical"
                ? "border-rose-400 bg-rose-50/80 text-rose-950 ring-2 ring-rose-400/20 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="text-lg sm:text-xl font-black text-rose-700">
              {data.critical.length} Batches
            </div>
            <span className="text-xs font-bold text-rose-900">
              🚨 Critical (&lt; 30 Days)
            </span>
          </button>

          <button
            onClick={() => setActiveTab("warning")}
            className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all ${
              activeTab === "warning"
                ? "border-amber-400 bg-amber-50/80 text-amber-950 ring-2 ring-amber-400/20 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="text-lg sm:text-xl font-black text-amber-700">
              {data.warning.length} Batches
            </div>
            <span className="text-xs font-bold text-amber-900">
              ⚠️ Near Expiry (&lt; 90 Days)
            </span>
          </button>

          <button
            onClick={() => setActiveTab("expired")}
            className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all ${
              activeTab === "expired"
                ? "border-slate-800 bg-slate-100 text-slate-950 ring-2 ring-slate-800/20 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div className="text-lg sm:text-xl font-black text-slate-800">
              {data.expired.length} Batches
            </div>
            <span className="text-xs font-bold text-slate-700">
              ⛔ Already Expired
            </span>
          </button>
        </div>

        {/* Batches Table / Cards */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {currentList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-700">
                No batches found in this category
              </p>
              <p className="text-xs text-slate-400">
                Your stock is healthy and properly rotated using FEFO dispatch.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentList.map((batch) => {
                const daysLeft = Math.ceil(
                  (new Date(batch.expiryDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={batch.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {batch.medicine.name}
                        </h3>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                          Batch: {batch.batchNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {batch.medicine.genericName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>
                          Expiry Date:{" "}
                          <strong className="text-slate-800">
                            {new Date(batch.expiryDate).toLocaleDateString(
                              "en-IN",
                              { month: "short", year: "numeric", day: "numeric" }
                            )}
                          </strong>
                        </span>
                        {batch.supplier && (
                          <span className="text-emerald-800">
                            Distributor: {batch.supplier.name}
                          </span>
                        )}
                        {batch.medicine.rackLocation && (
                          <span>📍 {batch.medicine.rackLocation}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-500">
                          Stock at Risk
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          {batch.quantity} units (₹
                          {(batch.quantity * batch.purchaseRate).toFixed(2)})
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            daysLeft < 0
                              ? "text-rose-600"
                              : daysLeft < 30
                              ? "text-rose-600"
                              : "text-amber-600"
                          }`}
                        >
                          {daysLeft < 0
                            ? `Expired ${Math.abs(daysLeft)} days ago`
                            : `${daysLeft} days remaining`}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          alert(
                            `Vendor Return Initiated: Contacting ${
                              batch.supplier?.name || "Distributor"
                            } for credit note on Batch ${batch.batchNumber}.`
                          )
                        }
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition-all shadow-2xs"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Return Claim</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
