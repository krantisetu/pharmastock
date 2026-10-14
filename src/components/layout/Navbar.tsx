"use client";

import Link from "next/link";
import {
  Pill,
  MapPin,
  ShieldCheck,
  Zap,
  Bell,
  Search,
  UserCheck,
  Sparkles,
} from "lucide-react";

export function Navbar({ tenant }: { tenant: any }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-3">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Pill className="h-5 w-5 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  {tenant?.name || "Shree Mahalaxmi Medical"}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200/60 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  <MapPin className="h-2.5 w-2.5" /> Kolhapur
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  FDA: 20B/21B-KOP
                </span>
                <span className="hidden md:inline">• GST: 27AABCM8291Q1Z4</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <Link
            href="/pos"
            className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs font-medium text-slate-400 hover:border-teal-500 hover:bg-white hover:text-slate-600 transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search medicines, salts (Paracetamol), batches...</span>
            </div>
            <kbd className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
              POS
            </kbd>
          </Link>
        </div>

        {/* Action Header & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Expiry Alerts Bell */}
          <Link
            href="/expiry-alerts"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-teal-700 transition-colors"
            title="Expiry & Stock Alerts"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </Link>

          {/* Fast POS Button */}
          <Link
            href="/pos"
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-95 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-teal-600/20 transition-all"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span className="hidden xs:inline">Fast POS Bill</span>
            <span className="xs:hidden">Bill</span>
          </Link>

          {/* User Profile Pill */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs ring-2 ring-slate-100">
              AP
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {tenant?.ownerName?.split("(")[0]?.trim() || "Abhijit Patil"}
              </span>
              <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-0.5">
                <UserCheck className="h-2.5 w-2.5" /> Pharmacist
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
