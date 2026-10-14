"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Boxes,
  ReceiptText,
  AlertTriangle,
  Menu,
  X,
  FileCheck2,
  BookOpen,
  Truck,
  Camera,
  ShieldCheck,
  ChevronRight,
  Pill,
  MapPin,
  TrendingUp,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Amazon's 5 Iconic Mobile Tabs
  const tabs = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "stock",
      label: "Stock",
      href: "/inventory",
      icon: Boxes,
    },
    {
      id: "pos",
      label: "Counter Bill",
      href: "/pos",
      icon: ReceiptText,
      badge: "FEFO",
    },
    {
      id: "alerts",
      label: "Alerts",
      href: "/expiry-alerts",
      icon: AlertTriangle,
      dotBadge: true,
    },
    {
      id: "menu",
      label: "Menu",
      icon: Menu,
      isMenuTrigger: true,
    },
  ];

  const quickLinks = [
    {
      label: "Schedule H1 Register",
      desc: "Maharashtra FDA compliance audit",
      href: "/schedule-h1",
      icon: FileCheck2,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      label: "Customer Khata (Credit)",
      desc: "Patient credit ledger & payments",
      href: "/khata",
      icon: BookOpen,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      label: "Kolhapur Distributors",
      desc: "Shahupuri & Laxmipuri stockists",
      href: "/suppliers",
      icon: Truck,
      color: "bg-teal-50 text-teal-700 border-teal-200",
    },
    {
      label: "Fast POS Counter",
      desc: "Barcode scan & WhatsApp e-bill",
      href: "/pos",
      icon: ReceiptText,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
  ];

  return (
    <>
      {/* AMAZON-STYLE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 z-40 w-full border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.07)] select-none">
        <div className="grid h-15 grid-cols-5 items-stretch">
          {tabs.map((tab) => {
            const isActive = tab.href ? pathname === tab.href : isMenuOpen;
            const Icon = tab.icon;

            if (tab.isMenuTrigger) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
                    isMenuOpen
                      ? "text-teal-700 font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  aria-label="Open Menu"
                >
                  {/* Amazon Signature Active Top Accent Indicator Bar */}
                  {isMenuOpen && (
                    <span className="absolute top-0 h-[3px] w-9 rounded-b-md bg-teal-600 shadow-xs" />
                  )}

                  <div className="relative">
                    <Icon className="h-5 w-5 stroke-[2]" />
                  </div>
                  <span className="mt-1 text-[10px] tracking-tight font-medium">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                href={tab.href!}
                onClick={() => setIsMenuOpen(false)}
                className={`relative flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
                  isActive
                    ? "text-teal-700 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {/* Amazon Signature Active Top Accent Indicator Bar */}
                {isActive && (
                  <span className="absolute top-0 h-[3px] w-9 rounded-b-md bg-teal-600 shadow-xs" />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "stroke-[2.4]" : "stroke-[1.9]"
                    }`}
                  />

                  {/* Amazon-style Pill or Badge */}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-4 rounded-full bg-teal-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow-xs">
                      {tab.badge}
                    </span>
                  )}

                  {/* Dot Badge for Alerts */}
                  {tab.dotBadge && (
                    <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </div>

                <span className="mt-1 text-[10px] tracking-tight font-medium">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* AMAZON-STYLE SLIDE-UP MENU DRAWER */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-24 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Handle */}
            <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />

            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-black">
                  <Pill className="h-5 w-5 rotate-45" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Shree Mahalaxmi Medical
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <MapPin className="h-2.5 w-2.5 text-teal-700" />
                    Rajarampuri, Kolhapur
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full bg-slate-100 p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick App Shortcuts Grid (Amazon style) */}
            <div className="mt-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Pharma Management Modules
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {quickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3 hover:bg-slate-100 active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${item.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Regulatory & FDA Chemist Badge */}
            <div className="mt-5 rounded-2xl bg-teal-50 border border-teal-200/70 p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-teal-900">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span>Maharashtra FDA Chemist License</span>
              </div>
              <p className="text-[11px] text-teal-800 font-mono">
                DL No: MH-KOP-20B-184920 / 21B-184921
              </p>
              <p className="text-[11px] text-teal-700 font-mono">
                GSTIN: 27AABCM8291Q1Z4
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
