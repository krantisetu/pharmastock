"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper: Get or fallback to the primary tenant
export async function getTenant() {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: "mahalaxmi-medical" },
  });
  if (!tenant) {
    return await prisma.tenant.findFirst();
  }
  return tenant;
}

export async function getDashboardStats() {
  const tenant = await getTenant();
  if (!tenant) return null;

  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const ninetyDaysLater = new Date();
  ninetyDaysLater.setDate(ninetyDaysLater.getDate() + 90);

  // Queries
  const totalMedicines = await prisma.medicine.count({
    where: { tenantId: tenant.id },
  });

  const batches = await prisma.batch.findMany({
    where: {
      tenantId: tenant.id,
      quantity: { gt: 0 },
    },
    include: {
      medicine: true,
    },
  });

  // Calculate stock metrics
  let totalStockUnits = 0;
  let totalInventoryValue = 0;
  let expiredCount = 0;
  let criticalExpiryCount = 0; // < 30 days
  let nearExpiryCount = 0; // 30 - 90 days

  batches.forEach((b) => {
    totalStockUnits += b.quantity;
    totalInventoryValue += b.quantity * b.purchaseRate;

    const exp = new Date(b.expiryDate);
    if (exp <= now) {
      expiredCount++;
    } else if (exp <= thirtyDaysLater) {
      criticalExpiryCount++;
    } else if (exp <= ninetyDaysLater) {
      nearExpiryCount++;
    }
  });

  // Low stock medicines
  const allMeds = await prisma.medicine.findMany({
    where: { tenantId: tenant.id },
    include: { batches: true },
  });

  let lowStockCount = 0;
  allMeds.forEach((m) => {
    const totalQty = m.batches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalQty <= m.minStockLevel) {
      lowStockCount++;
    }
  });

  // Recent sales & daily revenue
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todaySales = await prisma.saleInvoice.findMany({
    where: {
      tenantId: tenant.id,
      createdAt: { gte: startOfDay },
    },
  });

  const todayRevenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);
  const todayInvoicesCount = todaySales.length;

  // Total Customer Khata (Credit Outstanding)
  const customers = await prisma.customer.findMany({
    where: { tenantId: tenant.id },
  });
  const totalKhataBalance = customers.reduce(
    (acc, c) => acc + c.creditBalance,
    0
  );

  // Schedule H1 entries count
  const scheduleH1Count = await prisma.scheduleH1Log.count({
    where: { tenantId: tenant.id },
  });

  return {
    tenant,
    totalMedicines,
    totalStockUnits,
    totalInventoryValue: Math.round(totalInventoryValue),
    expiredCount,
    criticalExpiryCount,
    nearExpiryCount,
    lowStockCount,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    todayInvoicesCount,
    totalKhataBalance: Math.round(totalKhataBalance),
    scheduleH1Count,
  };
}

export async function getMedicines(params?: {
  search?: string;
  category?: string;
  scheduleType?: string;
}) {
  const tenant = await getTenant();
  if (!tenant) return [];

  const where: any = {
    tenantId: tenant.id,
    isActive: true,
  };

  if (params?.search) {
    const q = params.search.trim();
    where.OR = [
      { name: { contains: q } },
      { genericName: { contains: q } },
      { brand: { contains: q } },
      { barcode: { contains: q } },
    ];
  }

  if (params?.category && params.category !== "ALL") {
    where.category = params.category;
  }

  if (params?.scheduleType && params.scheduleType !== "ALL") {
    where.scheduleType = params.scheduleType;
  }

  const medicines = await prisma.medicine.findMany({
    where,
    include: {
      batches: {
        where: { quantity: { gt: 0 } },
        orderBy: { expiryDate: "asc" }, // FEFO default
      },
    },
    orderBy: { name: "asc" },
  });

  return medicines;
}

export async function getExpiryAlerts() {
  const tenant = await getTenant();
  if (!tenant) return { expired: [], critical: [], warning: [] };

  const now = new Date();
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  const ninetyDays = new Date();
  ninetyDays.setDate(ninetyDays.getDate() + 90);

  const batches = await prisma.batch.findMany({
    where: {
      tenantId: tenant.id,
      quantity: { gt: 0 },
      expiryDate: { lte: ninetyDays },
    },
    include: {
      medicine: true,
      supplier: true,
    },
    orderBy: { expiryDate: "asc" },
  });

  const expired: typeof batches = [];
  const critical: typeof batches = [];
  const warning: typeof batches = [];

  batches.forEach((b) => {
    const exp = new Date(b.expiryDate);
    if (exp <= now) {
      expired.push(b);
    } else if (exp <= thirtyDays) {
      critical.push(b);
    } else {
      warning.push(b);
    }
  });

  return { expired, critical, warning };
}

export interface CartItem {
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  mrp: number;
  saleRate: number;
  quantity: number;
  gstRate: number;
  scheduleType: string;
  unitsPerPack: number;
}

export interface CreateSaleInput {
  customerName?: string;
  customerPhone?: string;
  customerId?: string;
  doctorName?: string;
  doctorRegNo?: string;
  paymentMode: "CASH" | "UPI" | "CARD" | "CREDIT_KHATA";
  notes?: string;
  discountAmount?: number;
  items: CartItem[];
}

export async function createSaleInvoice(data: CreateSaleInput) {
  const tenant = await getTenant();
  if (!tenant) throw new Error("Tenant not found");

  if (!data.items || data.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate taxes and totals
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  const preparedItems = data.items.map((item) => {
    const itemSubtotal = item.saleRate * item.quantity;
    // GST calculation: inclusive or exclusive. In Indian retail pharma, MRP / Sale Price is inclusive of GST.
    // Base Price = Sale Price / (1 + GST Rate / 100)
    // GST Amount = Sale Price - Base Price
    const gstFraction = item.gstRate / (100 + item.gstRate);
    const itemTax = itemSubtotal * gstFraction;
    const cgst = itemTax / 2;
    const sgst = itemTax / 2;

    subtotal += itemSubtotal - itemTax;
    totalCgst += cgst;
    totalSgst += sgst;

    return {
      medicineId: item.medicineId,
      batchId: item.batchId,
      quantity: item.quantity,
      unitPrice: item.saleRate,
      mrp: item.mrp,
      gstRate: item.gstRate,
      cgstAmount: Math.round(cgst * 100) / 100,
      sgstAmount: Math.round(sgst * 100) / 100,
      totalAmount: itemSubtotal,
    };
  });

  const discount = Number(data.discountAmount || 0);
  const totalAmount = Math.max(
    0,
    Math.round((subtotal + totalCgst + totalSgst - discount) * 100) / 100
  );

  // Generate sequential invoice number
  const invoiceCount = await prisma.saleInvoice.count({
    where: { tenantId: tenant.id },
  });
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
    invoiceCount + 1
  ).padStart(4, "0")}`;

  // Execute database transaction
  const result = await prisma.$transaction(async (tx) => {
    // 1. Verify and decrement batches
    for (const item of data.items) {
      const batch = await tx.batch.findUnique({
        where: { id: item.batchId },
      });

      if (!batch || batch.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.medicineName} (Batch: ${item.batchNumber}). Available: ${batch?.quantity || 0}`
        );
      }

      await tx.batch.update({
        where: { id: item.batchId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    // 2. Create Sale Invoice
    const invoice = await tx.saleInvoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber,
        customerId: data.customerId || null,
        customerName: data.customerName || "Cash Customer",
        customerPhone: data.customerPhone || null,
        doctorName: data.doctorName || null,
        doctorRegNo: data.doctorRegNo || null,
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: discount,
        cgstAmount: Math.round(totalCgst * 100) / 100,
        sgstAmount: Math.round(totalSgst * 100) / 100,
        totalAmount,
        paymentMode: data.paymentMode,
        paymentStatus: data.paymentMode === "CREDIT_KHATA" ? "PENDING" : "PAID",
        notes: data.notes || null,
        items: {
          create: preparedItems,
        },
      },
      include: {
        items: {
          include: {
            medicine: true,
            batch: true,
          },
        },
      },
    });

    // 3. Update customer Khata if credit sale
    if (data.paymentMode === "CREDIT_KHATA" && data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: {
          creditBalance: { increment: totalAmount },
        },
      });
    }

    // 4. Log Schedule H1 medicines if present
    for (const item of data.items) {
      if (item.scheduleType === "SCHEDULE_H1") {
        await tx.scheduleH1Log.create({
          data: {
            tenantId: tenant.id,
            medicineName: item.medicineName,
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            patientName: data.customerName || "Walk-in Patient",
            patientPhone: data.customerPhone || null,
            doctorName: data.doctorName || "Registered Medical Practitioner",
            doctorRegNo: data.doctorRegNo || null,
            invoiceNumber: invoice.invoiceNumber,
          },
        });
      }
    }

    return invoice;
  });

  revalidatePath("/pos");
  revalidatePath("/inventory");
  revalidatePath("/");
  revalidatePath("/schedule-h1");
  revalidatePath("/khata");

  return result;
}

export async function getScheduleH1Logs() {
  const tenant = await getTenant();
  if (!tenant) return [];

  return await prisma.scheduleH1Log.findMany({
    where: { tenantId: tenant.id },
    orderBy: { date: "desc" },
  });
}

export async function getCustomers() {
  const tenant = await getTenant();
  if (!tenant) return [];

  return await prisma.customer.findMany({
    where: { tenantId: tenant.id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function recordKhataPayment(customerId: string, amount: number) {
  const tenant = await getTenant();
  if (!tenant) throw new Error("Tenant not found");

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) throw new Error("Customer not found");

  const newBalance = Math.max(0, customer.creditBalance - amount);

  await prisma.customer.update({
    where: { id: customerId },
    data: { creditBalance: newBalance },
  });

  revalidatePath("/khata");
  revalidatePath("/");
  return { success: true, newBalance };
}

export async function getSuppliers() {
  const tenant = await getTenant();
  if (!tenant) return [];

  return await prisma.supplier.findMany({
    where: { tenantId: tenant.id },
    include: {
      batches: {
        include: { medicine: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function addMedicine(formData: {
  name: string;
  genericName: string;
  brand: string;
  category?: any;
  dosageForm?: string;
  packaging?: string;
  unitsPerPack?: number;
  hsnCode?: string;
  gstRate?: number;
  scheduleType?: any;
  barcode?: string;
  minStockLevel?: number;
  rackLocation?: string;
  prescriptionRequired?: boolean;
  initialBatch?: {
    batchNumber: string;
    expiryDate: string;
    mrp: number;
    purchaseRate: number;
    saleRate: number;
    quantity: number;
    supplierId?: string;
  };
}) {
  const tenant = await getTenant();
  if (!tenant) throw new Error("Tenant not found");

  const { initialBatch, ...medData } = formData;

  const medicine = await prisma.medicine.create({
    data: {
      tenantId: tenant.id,
      name: medData.name,
      genericName: medData.genericName,
      brand: medData.brand,
      category: medData.category || "ALLOPATHY",
      dosageForm: medData.dosageForm || "TABLET",
      packaging: medData.packaging || "10 Tablets/Strip",
      unitsPerPack: Number(medData.unitsPerPack || 10),
      hsnCode: medData.hsnCode || "3004",
      gstRate: Number(medData.gstRate || 12.0),
      scheduleType: medData.scheduleType || "GENERAL",
      barcode: medData.barcode || null,
      minStockLevel: Number(medData.minStockLevel || 10),
      rackLocation: medData.rackLocation || null,
      prescriptionRequired: Boolean(medData.prescriptionRequired),
    },
  });

  if (initialBatch && initialBatch.batchNumber) {
    await prisma.batch.create({
      data: {
        tenantId: tenant.id,
        medicineId: medicine.id,
        batchNumber: initialBatch.batchNumber,
        expiryDate: new Date(initialBatch.expiryDate),
        mrp: Number(initialBatch.mrp),
        purchaseRate: Number(initialBatch.purchaseRate),
        saleRate: Number(initialBatch.saleRate),
        quantity: Number(initialBatch.quantity),
        initialQuantity: Number(initialBatch.quantity),
        supplierId: initialBatch.supplierId || null,
      },
    });
  }

  revalidatePath("/inventory");
  revalidatePath("/pos");
  revalidatePath("/");
  return medicine;
}

export async function addBatch(data: {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  mrp: number;
  purchaseRate: number;
  saleRate: number;
  quantity: number;
  supplierId?: string;
}) {
  const tenant = await getTenant();
  if (!tenant) throw new Error("Tenant not found");

  const batch = await prisma.batch.create({
    data: {
      tenantId: tenant.id,
      medicineId: data.medicineId,
      batchNumber: data.batchNumber,
      expiryDate: new Date(data.expiryDate),
      mrp: Number(data.mrp),
      purchaseRate: Number(data.purchaseRate),
      saleRate: Number(data.saleRate),
      quantity: Number(data.quantity),
      initialQuantity: Number(data.quantity),
      supplierId: data.supplierId || null,
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/pos");
  revalidatePath("/");
  return batch;
}
