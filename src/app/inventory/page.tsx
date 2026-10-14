"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Search,
  Plus,
  Boxes,
  Pill,
  Filter,
  X,
  AlertTriangle,
  MapPin,
  Barcode,
  Calendar,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { getMedicines, addMedicine, getSuppliers } from "@/lib/actions";
import { ImportModal } from "@/components/inventory/ImportModal";

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form states for new medicine
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    brand: "",
    category: "ALLOPATHY",
    dosageForm: "TABLET",
    packaging: "10 Tablets/Strip",
    unitsPerPack: 10,
    hsnCode: "3004",
    gstRate: 12.0,
    scheduleType: "GENERAL",
    barcode: "",
    minStockLevel: 15,
    rackLocation: "",
    prescriptionRequired: false,
    batchNumber: "",
    expiryDate: "",
    mrp: "",
    purchaseRate: "",
    saleRate: "",
    quantity: "",
    supplierId: "",
  });

  const loadData = async () => {
    const [meds, sups] = await Promise.all([getMedicines(), getSuppliers()]);
    setMedicines(meds);
    setSuppliers(sups);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchQ =
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.brand.toLowerCase().includes(q) ||
      (m.barcode && m.barcode.includes(q)) ||
      (m.rackLocation && m.rackLocation.toLowerCase().includes(q));

    const matchCat =
      categoryFilter === "ALL" || m.category === categoryFilter;

    return matchQ && matchCat;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await addMedicine({
          name: formData.name,
          genericName: formData.genericName,
          brand: formData.brand,
          category: formData.category,
          dosageForm: formData.dosageForm,
          packaging: formData.packaging,
          unitsPerPack: Number(formData.unitsPerPack),
          hsnCode: formData.hsnCode,
          gstRate: Number(formData.gstRate),
          scheduleType: formData.scheduleType,
          barcode: formData.barcode || undefined,
          minStockLevel: Number(formData.minStockLevel),
          rackLocation: formData.rackLocation || undefined,
          prescriptionRequired: formData.prescriptionRequired,
          initialBatch: formData.batchNumber
            ? {
                batchNumber: formData.batchNumber,
                expiryDate: formData.expiryDate,
                mrp: Number(formData.mrp),
                purchaseRate: Number(formData.purchaseRate),
                saleRate: Number(formData.saleRate),
                quantity: Number(formData.quantity),
                supplierId: formData.supplierId || undefined,
              }
            : undefined,
        });

        setIsModalOpen(false);
        await loadData();
      } catch (err: any) {
        alert(err.message || "Failed to add medicine");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header & New Medicine Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Medicine Stock &amp; Batches
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage inventory, FEFO batch expiry dates, and shelf locations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs active:scale-95 transition-all"
            >
              <FileSpreadsheet className="h-4 w-4 text-teal-600" />
              <span>Import CSV / Excel</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-teal-600/20 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Medicine</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Brand, Generic Chemical Salt, Barcode or Rack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium shadow-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Items" },
              { id: "ALLOPATHY", label: "Allopathy" },
              { id: "AYURVEDIC", label: "Ayurvedic" },
              { id: "OTC", label: "OTC" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medicines List */}
        <div className="space-y-3">
          {filtered.map((med) => {
            const totalStock = med.batches?.reduce(
              (acc: number, b: any) => acc + b.quantity,
              0
            );

            return (
              <div
                key={med.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900">
                        {med.name}
                      </h2>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {med.dosageForm}
                      </span>
                      {med.scheduleType === "SCHEDULE_H1" && (
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-800">
                          SCHEDULE H1
                        </span>
                      )}
                      {med.scheduleType === "SCHEDULE_H" && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          SCHEDULE H
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Salt:
                      </span>{" "}
                      {med.genericName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Mfr: {med.brand}</span>
                      <span>• HSN: {med.hsnCode}</span>
                      <span>• GST: {med.gstRate}%</span>
                      {med.rackLocation && (
                        <span className="text-emerald-700 font-semibold">
                          • 📍 {med.rackLocation}
                        </span>
                      )}
                      {med.barcode && <span>• Barcode: {med.barcode}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Total Stock</div>
                      <div
                        className={`text-lg font-black ${
                          totalStock <= med.minStockLevel
                            ? "text-amber-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {totalStock} units
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batches Table for this Medicine (FEFO Order) */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-1">
                        <th className="py-1">Batch No</th>
                        <th className="py-1">Expiry Date</th>
                        <th className="py-1">Qty Available</th>
                        <th className="py-1">Purchase Rate</th>
                        <th className="py-1">MRP</th>
                        <th className="py-1">Sale Rate</th>
                        <th className="py-1">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {med.batches?.map((batch: any) => {
                        const isExpired = new Date(batch.expiryDate) <= new Date();
                        const isCritical =
                          new Date(batch.expiryDate) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                        return (
                          <tr key={batch.id} className="font-mono text-[11px]">
                            <td className="py-2 font-bold text-slate-800">
                              {batch.batchNumber}
                            </td>
                            <td className="py-2">
                              {new Date(batch.expiryDate).toLocaleDateString(
                                "en-IN",
                                { month: "short", year: "numeric" }
                              )}
                            </td>
                            <td className="py-2 font-bold text-slate-900">
                              {batch.quantity}
                            </td>
                            <td className="py-2 text-slate-500">
                              ₹{batch.purchaseRate.toFixed(2)}
                            </td>
                            <td className="py-2 text-slate-500">
                              ₹{batch.mrp.toFixed(2)}
                            </td>
                            <td className="py-2 font-bold text-emerald-800">
                              ₹{batch.saleRate.toFixed(2)}
                            </td>
                            <td className="py-2">
                              {isExpired ? (
                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                                  EXPIRED
                                </span>
                              ) : isCritical ? (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                                  EXPIRING SOON
                                </span>
                              ) : (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                  HEALTHY (FEFO)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add New Medicine / Inward Stock
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">
                    Medicine Brand Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dolo 650mg Tablet"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">
                    Manufacturer / Company *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Micro Labs Ltd"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">
                  Generic Salt / Chemical Composition *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Paracetamol (650mg)"
                  value={formData.genericName}
                  onChange={(e) =>
                    setFormData({ ...formData, genericName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="ALLOPATHY">Allopathy</option>
                    <option value="AYURVEDIC">Ayurvedic</option>
                    <option value="OTC">OTC</option>
                    <option value="SURGICAL">Surgical</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">
                    Schedule Type
                  </label>
                  <select
                    value={formData.scheduleType}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduleType: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="GENERAL">General</option>
                    <option value="SCHEDULE_H">Schedule H</option>
                    <option value="SCHEDULE_H1">Schedule H1 (Mandatory)</option>
                    <option value="NARCOTIC">Narcotic</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) =>
                      setFormData({ ...formData, gstRate: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  >
                    <option value="5.0">5% (Ayurvedic/Basic)</option>
                    <option value="12.0">12% (Standard Pharma)</option>
                    <option value="18.0">18% (Supplements/OTC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">
                    Rack / Shelf Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A-1 (Shelf 2)"
                    value={formData.rackLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, rackLocation: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">
                    Barcode (EAN / UPC)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8901117001015"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              {/* Initial Batch Information */}
              <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3 space-y-3">
                <p className="font-bold text-emerald-950 text-xs">
                  Initial Batch & Stock Inward (Optional)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Batch No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B2409"
                      value={formData.batchNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, batchNumber: e.target.value })
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Quantity (Units)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Purchase Rate (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="₹"
                      value={formData.purchaseRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseRate: e.target.value,
                        })
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      MRP (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="₹"
                      value={formData.mrp}
                      onChange={(e) =>
                        setFormData({ ...formData, mrp: e.target.value })
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600">
                      Sale Rate (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="₹"
                      value={formData.saleRate}
                      onChange={(e) =>
                        setFormData({ ...formData, saleRate: e.target.value })
                      }
                      className="mt-0.5 w-full rounded border border-slate-200 bg-white p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  {isPending ? "Saving..." : "Save Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV / Excel Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
