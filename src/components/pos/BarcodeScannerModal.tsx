"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw, Barcode } from "lucide-react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let html5QrCode: any = null;

    if (isOpen) {
      import("html5-qrcode")
        .then(({ Html5Qrcode }) => {
          html5QrCode = new Html5Qrcode("reader-container");
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 260, height: 180 },
              },
              (decodedText: string) => {
                onScan(decodedText);
                onClose();
              },
              () => {
                // Ignore frame-by-frame read misses
              }
            )
            .then(() => {
              setCameraActive(true);
              setCameraError(null);
            })
            .catch((err: any) => {
              console.warn("Camera start warning:", err);
              setCameraError(
                "Camera access not available or permission denied. You can tap sample barcodes below to test."
              );
              setCameraActive(false);
            });
        })
        .catch((e) => {
          console.error("Failed to load html5-qrcode", e);
          setCameraError("Scanner module failed to load");
        });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
            setCameraActive(false);
          });
      }
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  const sampleBarcodes = [
    { name: "Dolo 650mg", code: "8901117001015" },
    { name: "Augmentin 625 Duo", code: "8901043003214" },
    { name: "Azithral 500mg", code: "8901088012019" },
    { name: "Pan 40mg", code: "8901117034013" },
    { name: "Shelcal 500mg", code: "8901088099881" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Scan Medicine Barcode
              </h3>
              <p className="text-[11px] text-slate-500">
                Point mobile camera at EAN / UPC box code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="my-4 overflow-hidden rounded-xl bg-slate-950 text-white min-h-[220px] relative flex flex-col items-center justify-center">
          <div id="reader-container" className="w-full"></div>

          {!cameraActive && !cameraError && (
            <div className="flex flex-col items-center gap-2 text-slate-400 p-6">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
              <p className="text-xs">Accessing mobile camera...</p>
            </div>
          )}

          {cameraError && (
            <div className="p-4 text-center">
              <p className="text-xs text-amber-300 font-medium">
                {cameraError}
              </p>
            </div>
          )}
        </div>

        {/* Quick Simulated Barcode Test Tap */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Barcode className="h-3.5 w-3.5 text-emerald-600" />
            <span>Quick Test Barcodes:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleBarcodes.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  onScan(item.code);
                  onClose();
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
