"use client";

import { useState, useTransition } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Boxes,
} from "lucide-react";
import { importMedicinesBulk, BulkMedicineRow } from "@/lib/actions";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [parsedRows, setParsedRows] = useState<BulkMedicineRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  // Download Sample CSV template
  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Medicine Name,Generic Composition,Manufacturer,Category,Dosage Form,HSN,GST Rate,Schedule,Barcode,Rack Location,Batch No,Expiry Date,Purchase Rate,MRP,Sale Rate,Quantity",
        "Dolo 650mg Tablet,Paracetamol (650mg),Micro Labs Ltd,ALLOPATHY,TABLET,3004,12,GENERAL,8901117001015,Rack A-1,DL2409,2027-05-31,24.00,34.50,33.00,100",
        "Augmentin 625 Duo,Amoxicillin (500mg) + Clavulanic Acid (125mg),GlaxoSmithKline,ALLOPATHY,TABLET,3004,12,SCHEDULE_H1,8901043003214,Rack B-2,AG8912,2027-03-31,162.00,204.50,195.00,50",
        "Liv.52 DS Tablet,Himsra + Kasani Formulation,Himalaya Wellness,AYURVEDIC,TABLET,3004,5,GENERAL,8901138831011,Rack E-1,LV4412,2028-02-28,145.00,190.00,180.00,40",
        "Benadryl Cough Syrup,Diphenhydramine + Ammonium Chloride,Johnson & Johnson,ALLOPATHY,SYRUP,3004,12,GENERAL,8901043019876,Rack F-1,BN9910,2027-02-28,102.00,135.00,128.00,30",
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pharma_stock_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV File Client-Side
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        // Split by lines
        const lines = text
          .split(/\r\n|\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          setErrorMsg("CSV file must have at least one data row after header");
          return;
        }

        const rows: BulkMedicineRow[] = [];

        // Parse line by line (skip header line 0)
        for (let i = 1; i < lines.length; i++) {
          // Simple CSV regex supporting commas within quotes if any
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          if (!values[0]) continue; // Name required

          rows.push({
            name: values[0] || "",
            genericName: values[1] || values[0],
            brand: values[2] || "Standard",
            category: values[3] || "ALLOPATHY",
            dosageForm: values[4] || "TABLET",
            hsnCode: values[5] || "3004",
            gstRate: Number(values[6]) || 12.0,
            scheduleType: values[7] || "GENERAL",
            barcode: values[8] || undefined,
            rackLocation: values[9] || undefined,
            batchNumber: values[10] || undefined,
            expiryDate: values[11] || undefined,
            purchaseRate: Number(values[12]) || 0,
            mrp: Number(values[13]) || 0,
            saleRate: Number(values[14]) || Number(values[13]) || 0,
            quantity: Number(values[15]) || 0,
          });
        }

        setParsedRows(rows);
      } catch (err: any) {
        setErrorMsg("Failed to parse CSV file: " + err.message);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedRows.length === 0) {
      setErrorMsg("No valid rows to import");
      return;
    }

    startTransition(async () => {
      try {
        const res = await importMedicinesBulk(parsedRows);
        setSuccessMsg(`Successfully imported ${res.count} medicines & batches to stock!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      } catch (err: any) {
        setErrorMsg(err.message || "Import failed");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Bulk Import Medicines (CSV / Excel)
              </h3>
              <p className="text-xs text-slate-500">
                Migrate inventory from Marg, Tally, or distributor Excel sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Bar: Download Sample Template */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/80">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">Need the template?</span>
            <p className="text-[11px] text-slate-500">
              Download our ready-made CSV template with sample Kolhapur medicines.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-all whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 text-teal-700" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Upload Zone */}
        <div className="mt-4">
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/40 p-6 text-center cursor-pointer hover:bg-teal-50/70 hover:border-teal-400 transition-all">
            <Upload className="h-8 w-8 text-teal-600 mb-2" />
            <span className="text-xs font-bold text-slate-800">
              {fileName ? fileName : "Click to browse or drop CSV file here"}
            </span>
            <span className="mt-1 text-[11px] text-slate-500">
              Supports .csv files with Medicine, Batch, Expiry &amp; MRP columns
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Parsed Rows Preview */}
        {parsedRows.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">
                Data Preview ({parsedRows.length} rows detected)
              </span>
              <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                Ready to Import
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100 text-slate-600 font-sans uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2">Exp</th>
                    <th className="p-2">MRP</th>
                    <th className="p-2 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-sans font-bold text-slate-800">
                        {r.name}
                      </td>
                      <td className="p-2 text-slate-500">
                        {r.batchNumber || "—"}
                      </td>
                      <td className="p-2 text-slate-500">
                        {r.expiryDate || "—"}
                      </td>
                      <td className="p-2 text-slate-900">
                        ₹{Number(r.mrp || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-right font-bold text-teal-700">
                        {r.quantity || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 10 && (
              <p className="text-[10px] text-slate-400 text-right">
                + {parsedRows.length - 10} more medicines
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={isPending || parsedRows.length === 0}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 px-5 py-2 text-xs font-black text-white shadow-md shadow-teal-600/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            {isPending ? (
              <span>Importing into Database...</span>
            ) : (
              <>
                <Boxes className="h-4 w-4" />
                <span>Import {parsedRows.length} Medicines</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
