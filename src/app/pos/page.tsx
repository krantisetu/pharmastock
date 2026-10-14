"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Search,
  Camera,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  QrCode,
  AlertOctagon,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  Sparkles,
  Barcode,
} from "lucide-react";
import {
  getMedicines,
  getTenant,
  getCustomers,
  createSaleInvoice,
  CartItem,
} from "@/lib/actions";
import { BarcodeScannerModal } from "@/components/pos/BarcodeScannerModal";
import { ReceiptModal } from "@/components/pos/ReceiptModal";

export default function PosPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  // Customer & Prescription fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState("Cash Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorRegNo, setDoctorRegNo] = useState("");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CREDIT_KHATA">("CASH");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [t, m, c] = await Promise.all([
        getTenant(),
        getMedicines(),
        getCustomers(),
      ]);
      setTenant(t);
      setMedicines(m);
      setCustomers(c);
    }
    loadData();
  }, []);

  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      med.name.toLowerCase().includes(q) ||
      med.genericName.toLowerCase().includes(q) ||
      (med.barcode && med.barcode.includes(q)) ||
      (med.rackLocation && med.rackLocation.toLowerCase().includes(q));

    const matchesCat =
      selectedCategory === "ALL" ||
      (selectedCategory === "SCHEDULE_H1"
        ? med.scheduleType === "SCHEDULE_H1"
        : med.category === selectedCategory);

    return matchesSearch && matchesCat;
  });

  const hasScheduleH1 = cart.some((it) => it.scheduleType === "SCHEDULE_H1");

  const addToCart = (med: any) => {
    setErrorMsg(null);
    if (!med.batches || med.batches.length === 0) {
      setErrorMsg(`No stock available for ${med.name}`);
      return;
    }

    const bestBatch = med.batches[0];
    const existingIndex = cart.findIndex(
      (it) => it.medicineId === med.id && it.batchId === bestBatch.id
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      if (updated[existingIndex].quantity + 1 > bestBatch.quantity) {
        setErrorMsg(`Only ${bestBatch.quantity} available in batch ${bestBatch.batchNumber}`);
        return;
      }
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        medicineId: med.id,
        medicineName: med.name,
        genericName: med.genericName,
        batchId: bestBatch.id,
        batchNumber: bestBatch.batchNumber,
        expiryDate: new Date(bestBatch.expiryDate).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        mrp: bestBatch.mrp,
        saleRate: bestBatch.saleRate,
        quantity: 1,
        gstRate: med.gstRate,
        scheduleType: med.scheduleType,
        unitsPerPack: med.unitsPerPack,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQty = (index: number, delta: number) => {
    setErrorMsg(null);
    const updated = [...cart];
    const target = updated[index];
    const med = medicines.find((m) => m.id === target.medicineId);
    const batch = med?.batches?.find((b: any) => b.id === target.batchId);

    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else if (batch && newQty > batch.quantity) {
      setErrorMsg(`Only ${batch.quantity} available in this batch`);
      return;
    } else {
      target.quantity = newQty;
    }
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const handleBarcodeScanned = (code: string) => {
    setSearchQuery(code);
    const match = medicines.find((m) => m.barcode === code);
    if (match) {
      addToCart(match);
    } else {
      setErrorMsg(`No medicine found matching barcode ${code}`);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (customerId) {
      const cust = customers.find((c) => c.id === customerId);
      if (cust) {
        setCustomerName(cust.name);
        setCustomerPhone(cust.phone);
        if (cust.doctorName) setDoctorName(cust.doctorName);
      }
    } else {
      setCustomerName("Cash Customer");
      setCustomerPhone("");
      setDoctorName("");
    }
  };

  const subtotal = cart.reduce((sum, it) => sum + it.saleRate * it.quantity, 0);
  const total = Math.max(0, subtotal - (discountAmount || 0));

  const handleCheckout = () => {
    if (cart.length === 0) {
      setErrorMsg("Please add medicines to bill");
      return;
    }

    if (hasScheduleH1 && (!doctorName.trim() || !customerName.trim())) {
      setErrorMsg(
        "Maharashtra FDA Schedule H1 compliance: Patient Name and Doctor Name are mandatory."
      );
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      try {
        const invoice = await createSaleInvoice({
          customerName,
          customerPhone,
          customerId: selectedCustomerId || undefined,
          doctorName: doctorName || undefined,
          doctorRegNo: doctorRegNo || undefined,
          paymentMode,
          discountAmount,
          items: cart,
        });

        setLastInvoice(invoice);
        setIsReceiptOpen(true);
        setCart([]);
        setDiscountAmount(0);

        const updatedMeds = await getMedicines();
        setMedicines(updatedMeds);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to process sale");
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] pb-24 md:pb-6 bg-[#F8FAFC]">
      {/* LEFT SECTION: Search & Medicines Catalog */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
        {/* Search Bar + Camera Button */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Brand (Dolo), Salt (Paracetamol), Barcode, or Rack location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium shadow-xs outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-teal-600 hover:bg-teal-500 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
            title="Scan Medicine Barcode with Mobile Camera"
          >
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Camera Scan</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
          {[
            { id: "ALL", label: "All Items" },
            { id: "ALLOPATHY", label: "Allopathy" },
            { id: "SCHEDULE_H1", label: "🚨 Schedule H1" },
            { id: "AYURVEDIC", label: "🌿 Ayurvedic" },
            { id: "OTC", label: "OTC" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-3 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800 animate-in fade-in">
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Medicine Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredMedicines.map((med) => {
            const primaryBatch = med.batches?.[0];
            const totalStock = med.batches?.reduce(
              (acc: number, b: any) => acc + b.quantity,
              0
            );

            return (
              <div
                key={med.id}
                onClick={() => addToCart(med)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-teal-500 hover:shadow-md active:scale-[0.98] cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 leading-snug">
                      {med.name}
                    </h3>
                    {med.scheduleType === "SCHEDULE_H1" && (
                      <span className="shrink-0 rounded-md bg-rose-100 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-800">
                        SCH H1
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                    {med.genericName}
                  </p>
                  <p className="text-[10px] text-slate-400">{med.brand}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <span>₹{primaryBatch?.saleRate.toFixed(2)}</span>
                      {primaryBatch?.mrp > primaryBatch?.saleRate && (
                        <span className="text-[10px] text-slate-400 font-normal line-through">
                          ₹{primaryBatch?.mrp.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {med.rackLocation && (
                      <span className="text-[10px] font-mono text-teal-700 font-medium">
                        📍 {med.rackLocation}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        totalStock <= med.minStockLevel
                          ? "bg-amber-100 text-amber-800"
                          : "bg-teal-50 text-teal-800"
                      }`}
                    >
                      {totalStock} in stock
                    </span>
                    {primaryBatch && (
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        FEFO Exp:{" "}
                        {new Date(primaryBatch.expiryDate).toLocaleDateString(
                          "en-IN",
                          { month: "short", year: "2-digit" }
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SECTION: Cart, Prescription Compliance & Checkout */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200/80 bg-white p-4 sm:p-5 flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Active Bill</h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  FEFO Auto-Allocated Batches
                </p>
              </div>
            </div>
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-extrabold text-teal-800">
              {cart.reduce((sum, it) => sum + it.quantity, 0)} units
            </span>
          </div>

          {/* Schedule H1 Alert Banner */}
          {hasScheduleH1 && (
            <div className="my-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Schedule H1 Antibiotic / Habit-Forming</span>
              </div>
              <p className="mt-1 text-[11px] text-rose-700 leading-tight">
                Mandatory for FDA Kolhapur inspection: Prescribing Doctor &amp;
                Patient info required.
              </p>
            </div>
          )}

          {/* Customer Selection */}
          <div className="my-3 space-y-2">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
              <User className="h-3.5 w-3.5 text-teal-600" />
              <span>Customer / Patient:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs font-medium text-slate-800"
              >
                <option value="">Walk-in / Cash</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.creditBalance > 0 ? `(Khata: ₹${c.creditBalance})` : ""}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Patient Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800"
              />
            </div>
            <input
              type="tel"
              placeholder="WhatsApp Number (for e-receipt)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800"
            />

            {/* Doctor Info */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                placeholder="Doctor Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className={`w-full rounded-xl border p-2 text-xs font-medium text-slate-800 ${
                  hasScheduleH1 && !doctorName
                    ? "border-rose-300 bg-rose-50/50"
                    : "border-slate-200 bg-white"
                }`}
              />
              <input
                type="text"
                placeholder="Doctor MMC Reg No."
                value={doctorRegNo}
                onChange={(e) => setDoctorRegNo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 my-2 pr-1">
            {cart.length === 0 ? (
              <div className="py-7 text-center text-slate-400">
                <Receipt className="mx-auto h-7 w-7 stroke-1 text-slate-300" />
                <p className="mt-1 text-xs font-medium">Cart is currently empty</p>
                <p className="text-[11px] text-slate-400">
                  Tap medicines on the left or scan a box barcode
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item.medicineId}-${item.batchId}`} className="py-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.medicineName}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Batch: {item.batchNumber} • Exp: {item.expiryDate}
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      ₹{(item.saleRate * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      ₹{item.saleRate.toFixed(2)} / strip
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                        <button
                          onClick={() => updateQty(index, -1)}
                          className="p-1 hover:bg-slate-200 rounded-l-xl transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(index, 1)}
                          className="p-1 hover:bg-slate-200 rounded-r-xl transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bill Summary & Checkout */}
        <div className="border-t border-slate-200 pt-3 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
              Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "CASH", label: "Cash", icon: IndianRupee },
                { id: "UPI", label: "UPI / QR", icon: QrCode },
                { id: "CREDIT_KHATA", label: "Khata (Udhaar)", icon: CreditCard },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id as any)}
                  className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-bold transition-all ${
                    paymentMode === m.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <m.icon className="h-3.5 w-3.5 mb-0.5" />
                  <span className="text-[10px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Incl. GST):</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Special Discount:</span>
              <div className="flex items-center gap-1">
                <span>-₹</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-right font-medium text-xs text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>Net Payable:</span>
              <span className="text-teal-700">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isPending || cart.length === 0}
            className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] py-3 text-sm font-black text-white shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isPending ? (
              <span>Processing Sale & Stock Deduction...</span>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                <span>Complete Sale (₹{total.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        invoice={lastInvoice}
        tenant={tenant}
      />
    </div>
  );
}
