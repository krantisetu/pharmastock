"use client";

import { useEffect, useState, useTransition } from "react";
import {
  BookOpen,
  User,
  Phone,
  IndianRupee,
  CheckCircle,
  Clock,
  History,
  X,
} from "lucide-react";
import { getCustomers, recordKhataPayment } from "@/lib/actions";

export default function KhataPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    const list = await getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0);

  const handleSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !payAmount) return;

    startTransition(async () => {
      try {
        await recordKhataPayment(selectedCustomer.id, Number(payAmount));
        setSelectedCustomer(null);
        setPayAmount("");
        await loadData();
      } catch (err: any) {
        alert(err.message || "Failed to record payment");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <span>Customer Khata (Credit Diary)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage patient credit accounts, settlements, and payment receipts
            </p>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-right">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              Total Outstanding Khata
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-950">
              ₹{totalCredit.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
                      {cust.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {cust.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Phone className="h-3 w-3" />
                        <span>{cust.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-lg px-2 py-1 text-xs font-black ${
                        cust.creditBalance > 0
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      ₹{cust.creditBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {cust.address && (
                  <p className="mt-2 text-xs text-slate-500">
                    📍 {cust.address}
                  </p>
                )}

                {cust.doctorName && (
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Regular Doctor: {cust.doctorName}
                  </p>
                )}
              </div>

              {/* Actions & Recent Sales */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {cust.sales?.length || 0} recent invoices
                </span>

                <button
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setPayAmount(String(cust.creditBalance));
                  }}
                  disabled={cust.creditBalance <= 0}
                  className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Receive Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settle Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Receive Khata Payment
              </h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSettle} className="mt-3 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Patient:</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedCustomer.name} ({selectedCustomer.phone})
                </p>
                <p className="text-xs font-semibold text-rose-700 mt-1">
                  Current Khata Balance: ₹{selectedCustomer.creditBalance.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Amount Received (₹):
                </label>
                <div className="relative mt-1">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    max={selectedCustomer.creditBalance}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-bold text-slate-900 outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-500"
                >
                  {isPending ? "Recording..." : "Confirm Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
