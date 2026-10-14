import Link from "next/link";
import {
  Pill,
  Receipt,
  AlertTriangle,
  IndianRupee,
  Boxes,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  BookOpen,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  if (!stats) return null;

  let recentSales: any[] = [];
  let topMedicines: any[] = [];

  try {
    const [sales, meds] = await Promise.all([
      prisma.saleInvoice.findMany({
        where: { tenantId: stats.tenant.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: { medicine: true, batch: true },
          },
        },
      }),
      prisma.medicine.findMany({
        where: { tenantId: stats.tenant.id },
        include: {
          batches: {
            where: { quantity: { gt: 0 } },
          },
        },
        take: 5,
      }),
    ]);
    recentSales = sales;
    topMedicines = meds;
  } catch (err) {
    console.error("Dashboard query warning:", err);
  }

  // Mock weekly activity bars for Behance chart styling
  const weeklyActivity = [
    { day: "Mon", sales: 4800, height: "65%" },
    { day: "Tue", sales: 6200, height: "80%" },
    { day: "Wed", sales: 5400, height: "70%" },
    { day: "Thu", sales: 7100, height: "92%" },
    { day: "Fri", sales: 6800, height: "85%" },
    { day: "Sat", sales: 8500, height: "100%", isHighest: true },
    { day: "Sun", sales: 5900, height: "75%" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-10">
      {/* Top Banner / Store Header */}
      <div className="border-b border-slate-200/80 bg-white px-4 py-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                <MapPin className="h-3 w-3" /> Kolhapur, MH
              </span>
              <span className="text-[11px] text-slate-400 font-mono">•</span>
              <span className="text-[11px] font-semibold text-slate-500">
                Single Store Cloud POS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pharmacy Admin Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {stats.tenant.name} • {stats.tenant.address}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/inventory"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-all"
            >
              <Boxes className="h-3.5 w-3.5 text-slate-500" />
              <span>Inward Stock</span>
            </Link>
            <Link
              href="/pos"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-teal-600/20 transition-all"
            >
              <Zap className="h-3.5 w-3.5 fill-white" />
              <span>New Counter Bill</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* KPI Row (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Revenue */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Today&apos;s Revenue
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              ₹{stats.todayRevenue.toLocaleString("en-IN")}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 text-[11px]">
                <ArrowUpRight className="h-3 w-3" /> +14.2%
              </span>
              <span className="text-slate-400 font-medium">
                {stats.todayInvoicesCount} sales counter
              </span>
            </div>
          </div>

          {/* Card 2: Active Inventory Stock */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stock Valuation
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Boxes className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              ₹{stats.totalInventoryValue.toLocaleString("en-IN")}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-bold text-blue-700 text-[11px]">
                {stats.totalStockUnits} units available
              </span>
              <span className="text-slate-400 font-medium">
                {stats.totalMedicines} medicines
              </span>
            </div>
          </div>

          {/* Card 3: Expiry Date Risk Monitor */}
          <Link
            href="/expiry-alerts"
            className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Expiry Alerts
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-amber-950">
              {stats.criticalExpiryCount + stats.nearExpiryCount} Batches
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-800">
                {stats.criticalExpiryCount} critical (&lt;30d)
              </span>
              <span className="text-amber-800 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Inspect <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          {/* Card 4: Customer Khata Outstanding */}
          <Link
            href="/khata"
            className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Khata
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-purple-950">
              ₹{stats.totalKhataBalance.toLocaleString("en-IN")}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium text-[11px]">
                Credit diary ledger
              </span>
              <span className="text-purple-700 font-bold flex items-center gap-0.5">
                Settle <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* Analytics & Visualization Row (Behance style) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart Card: Weekly Sales Activity */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Weekly Sales Activity &amp; Prescriptions
                </h2>
                <p className="text-xs text-slate-500">
                  Counter turnover performance across past 7 days
                </p>
              </div>
              <span className="rounded-lg bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">
                This Week
              </span>
            </div>

            {/* Micro Bar Chart */}
            <div className="mt-6 flex items-end justify-between gap-3 h-44 px-2">
              {weeklyActivity.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-slate-400 group-hover:text-teal-700 transition-colors">
                    ₹{(item.sales / 1000).toFixed(1)}k
                  </div>
                  <div className="w-full bg-slate-100 rounded-t-xl h-32 flex items-end p-1">
                    <div
                      style={{ height: item.height }}
                      className={`w-full rounded-t-lg transition-all ${
                        item.isHighest
                          ? "bg-gradient-to-t from-teal-600 to-emerald-500 shadow-sm"
                          : "bg-teal-400/50 group-hover:bg-teal-500"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Distribution / Inventory Breakdown */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Stock Composition
                  </h2>
                  <p className="text-xs text-slate-500">By pharma drug category</p>
                </div>
                <Pill className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-4 space-y-3.5">
                {[
                  {
                    name: "Allopathy (Tablets/Capsules)",
                    percent: 65,
                    color: "bg-teal-500",
                    count: "12 Items",
                  },
                  {
                    name: "Antibiotics (Schedule H1)",
                    percent: 15,
                    color: "bg-rose-500",
                    count: "4 Items",
                  },
                  {
                    name: "Syrups & Topicals",
                    percent: 12,
                    color: "bg-blue-500",
                    count: "3 Items",
                  },
                  {
                    name: "Ayurvedic Formulations",
                    percent: 8,
                    color: "bg-emerald-600",
                    count: "2 Items",
                  },
                ].map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {cat.name}
                      </span>
                      <span className="font-mono text-slate-500">
                        {cat.percent}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${cat.percent}%` }}
                        className={`h-full rounded-full ${cat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-teal-50/70 border border-teal-100 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                <span className="font-bold text-teal-900">
                  FDA Schedule H1 Audit
                </span>
              </div>
              <Link
                href="/schedule-h1"
                className="font-bold text-teal-700 hover:text-teal-900"
              >
                View ({stats.scheduleH1Count})
              </Link>
            </div>
          </div>
        </div>

        {/* Fast Moving Stock & Recent Invoices Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Fast Moving Inventory */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Top Dispensed Medicines
              </h2>
              <Link
                href="/inventory"
                className="text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                All Stock
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {topMedicines.map((med: any) => {
                const totalStock = med.batches?.reduce(
                  (acc: number, b: any) => acc + b.quantity,
                  0
                ) || 0;
                return (
                  <div
                    key={med.id}
                    className="py-2.5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {med.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {med.brand}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          totalStock <= med.minStockLevel
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {totalStock} in stock
                      </span>
                      {med.rackLocation && (
                        <div className="text-[9px] text-teal-700 font-mono mt-0.5">
                          {med.rackLocation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Invoices Table (2 Columns Span) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent Sales &amp; Invoices
                </h2>
                <p className="text-xs text-slate-500">
                  Point-of-sale customer receipts at Shree Mahalaxmi Medical
                </p>
              </div>
              <Link
                href="/pos"
                className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                <span>New POS Bill</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-1">
                    <th className="py-2">Invoice</th>
                    <th className="py-2">Customer / Doctor</th>
                    <th className="py-2">Date &amp; Time</th>
                    <th className="py-2">Payment</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-bold text-slate-900 font-mono text-[11px]">
                        {sale.invoiceNumber}
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-800">
                          {sale.customerName}
                        </div>
                        {sale.doctorName && (
                          <div className="text-[10px] text-teal-700">
                            Dr: {sale.doctorName}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {new Date(sale.createdAt).toLocaleDateString("en-IN")}{" "}
                        {new Date(sale.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            sale.paymentMode === "UPI"
                              ? "bg-purple-100 text-purple-800"
                              : sale.paymentMode === "CREDIT_KHATA"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {sale.paymentMode}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-black text-slate-900">
                        ₹{sale.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
