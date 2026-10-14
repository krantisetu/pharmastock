"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ReceiptText,
  Boxes,
  AlertTriangle,
  BookOpen,
  FileCheck2,
  Truck,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

interface SidebarLink {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  alertBadge?: boolean;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

export function Sidebar() {
  const pathname = usePathname();

  const sections: SidebarSection[] = [
    {
      title: "Core Operations",
      links: [
        { label: "Dashboard", href: "/", icon: LayoutDashboard },
        { label: "Fast POS Billing", href: "/pos", icon: ReceiptText, badge: "FEFO" },
      ],
    },
    {
      title: "Inventory & Safety",
      links: [
        { label: "Medicine & Batches", href: "/inventory", icon: Boxes },
        { label: "Expiry & Deadstock", href: "/expiry-alerts", icon: AlertTriangle, alertBadge: true },
        { label: "Schedule H1 Register", href: "/schedule-h1", icon: FileCheck2 },
      ],
    },
    {
      title: "Ledgers & Supply",
      links: [
        { label: "Customer Khata", href: "/khata", icon: BookOpen },
        { label: "Distributors", href: "/suppliers", icon: Truck },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 p-4 shrink-0 shadow-lg select-none">
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {section.title}
            </p>
            {section.links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border-l-2 border-teal-400 shadow-inner"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive
                          ? "text-teal-400 stroke-[2.2]"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                    <span>{link.label}</span>
                  </div>

                  {link.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                        isActive
                          ? "bg-teal-500/30 text-teal-300 border border-teal-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Store Status Pill */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>FDA Kolhapur Licensed</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            DL: MH-KOP-20B-184920
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>FEFO Stock Engine Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
