"use client";

import { Printer, Share2, X, CheckCircle2 } from "lucide-react";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  tenant: any;
}

export function ReceiptModal({
  isOpen,
  onClose,
  invoice,
  tenant,
}: ReceiptModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppLink = () => {
    const storeName = tenant?.name || "Shree Mahalaxmi Medical";
    const address = tenant?.address || "Rajarampuri, Kolhapur";
    const dlNo = tenant?.dlNumber || "MH-KOP-20B-184920 / 21B-184921";
    const gstin = tenant?.gstin || "27AABCM8291Q1Z4";

    let itemsList = "";
    if (invoice.items && invoice.items.length > 0) {
      itemsList = invoice.items
        .map(
          (it: any, idx: number) =>
            `${idx + 1}. *${it.medicine?.name || "Medicine"}* (Batch: ${
              it.batch?.batchNumber || "N/A"
            })\n   Qty: ${it.quantity} x ₹${it.unitPrice.toFixed(
              2
            )} = ₹${it.totalAmount.toFixed(2)}`
        )
        .join("\n");
    }

    const message = `🧾 *${storeName}*
📍 ${address}
📜 DL: ${dlNo} | GST: ${gstin}
──────────────────────
*Tax Invoice:* ${invoice.invoiceNumber}
*Date:* ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}
*Customer:* ${invoice.customerName} ${
      invoice.customerPhone ? `(${invoice.customerPhone})` : ""
    }
${invoice.doctorName ? `*Doctor:* ${invoice.doctorName}` : ""}
──────────────────────
*Prescribed Items:*
${itemsList}
──────────────────────
Subtotal: ₹${invoice.subtotal?.toFixed(2)}
CGST: ₹${invoice.cgstAmount?.toFixed(2)}
SGST: ₹${invoice.sgstAmount?.toFixed(2)}
*Total Net Paid:* ₹${invoice.totalAmount?.toFixed(2)}
*Payment Mode:* ${invoice.paymentMode} (${invoice.paymentStatus})
──────────────────────
_Thank you! Get well soon._ 🙏`;

    const phone = invoice.customerPhone
      ? invoice.customerPhone.replace(/[^0-9]/g, "")
      : "";
    const cleanPhone = phone.startsWith("91") ? phone : `91${phone}`;

    return phone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Sale Completed!</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thermal Receipt Paper (3-inch / 80mm format) */}
        <div className="my-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-4 font-mono text-xs text-slate-800 print:border-none print:p-0 print:bg-white">
          <div className="text-center space-y-0.5">
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">
              {tenant?.name || "Shree Mahalaxmi Medical & General Store"}
            </h2>
            <p className="text-[10px] text-slate-600">
              {tenant?.address || "Rajarampuri 2nd Lane, Kolhapur"}
            </p>
            <p className="text-[10px] font-semibold text-emerald-800">
              DL: {tenant?.dlNumber || "MH-KOP-20B-184920 / 21B-184921"}
            </p>
            <p className="text-[10px] text-slate-600">
              GSTIN: {tenant?.gstin || "27AABCM8291Q1Z4"}
            </p>
            <p className="text-[10px] text-slate-500">Ph: {tenant?.phone}</p>
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Invoice:</span>
              <span className="font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>
                {new Date(invoice.createdAt).toLocaleDateString("en-IN")}{" "}
                {new Date(invoice.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold">{invoice.customerName}</span>
            </div>
            {invoice.doctorName && (
              <div className="flex justify-between text-slate-600">
                <span>Dr:</span>
                <span>{invoice.doctorName}</span>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          {/* Itemized Table */}
          <div className="space-y-1.5 text-[11px]">
            <div className="grid grid-cols-12 font-bold text-slate-700 pb-1 border-b border-slate-200">
              <span className="col-span-6">Item / Batch</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate</span>
              <span className="col-span-2 text-right">Amt</span>
            </div>

            {invoice.items?.map((it: any, i: number) => (
              <div key={i} className="grid grid-cols-12 py-0.5">
                <div className="col-span-6 leading-tight">
                  <div className="font-semibold text-slate-900">
                    {it.medicine?.name || "Medicine"}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    B:{it.batch?.batchNumber}
                  </div>
                </div>
                <div className="col-span-2 text-center">{it.quantity}</div>
                <div className="col-span-2 text-right">
                  {it.unitPrice.toFixed(2)}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {it.totalAmount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />

          {/* Tax Breakdown & Total */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span>₹{invoice.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>CGST:</span>
              <span>₹{invoice.cgstAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST:</span>
              <span>₹{invoice.sgstAmount?.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-₹{invoice.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-300">
              <span>NET TOTAL:</span>
              <span>₹{invoice.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
              <span>Mode: {invoice.paymentMode}</span>
              <span className="uppercase font-semibold text-emerald-800">
                [{invoice.paymentStatus}]
              </span>
            </div>
          </div>

          <div className="my-2 border-t border-dashed border-slate-300" />
          <p className="text-center text-[10px] text-slate-500">
            *** Wish You a Speedy Recovery ***
          </p>
        </div>

        {/* Action Buttons (Print & WhatsApp) */}
        <div className="grid grid-cols-2 gap-2 pt-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Slip</span>
          </button>
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm transition-all"
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp Bill</span>
          </a>
        </div>
      </div>
    </div>
  );
}
