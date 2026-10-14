const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for PharmaStock (Kolhapur Edition)...');

  // 1. Create or upsert Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'mahalaxmi-medical' },
    update: {},
    create: {
      name: 'Shree Mahalaxmi Medical & General Store',
      slug: 'mahalaxmi-medical',
      ownerName: 'Abhijit Patil (B.Pharm, Reg No. 142890)',
      phone: '+91 98220 54321',
      email: 'mahalaxmimedical.kop@gmail.com',
      address: 'Shop No. 4, Ground Floor, Rajarampuri 2nd Lane, Kolhapur, Maharashtra',
      city: 'Kolhapur',
      state: 'Maharashtra',
      pincode: '416008',
      dlNumber: 'MH-KOP-20B-184920 / 21B-184921',
      gstin: '27AABCM8291Q1Z4',
      fssai: '11521034000123',
    },
  });

  console.log(`✅ Tenant created: ${tenant.name} (${tenant.id})`);

  // 2. Create Default Admin/Pharmacist User
  await prisma.user.upsert({
    where: { email: 'admin@mahalaxmimedical.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Abhijit Patil',
      email: 'admin@mahalaxmimedical.com',
      phone: '+91 98220 54321',
      role: 'ADMIN',
      password: 'admin123',
    },
  });

  // 3. Create Local Kolhapur Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: 'Mahalaxmi Pharma Distributors',
      contactPerson: 'Sachin Oswal',
      phone: '0231-2651234 / +91 94220 33445',
      email: 'orders@mahalaxmidist.com',
      address: 'Gala No. 12, Station Road, Shahupuri, Kolhapur',
      city: 'Kolhapur',
      gstin: '27AABCM1122A1Z1',
      dlNumber: 'MH-KOP-20B-109281 / 21B-109282',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: 'Kolhapur Medico Agency',
      contactPerson: 'Vikas Shah',
      phone: '0231-2645678 / +91 98230 77889',
      email: 'kolhapurmedico@yahoo.com',
      address: 'Shop 18, Commercial Complex, Laxmipuri, Kolhapur',
      city: 'Kolhapur',
      gstin: '27BXYZA3344B2Z2',
      dlNumber: 'MH-KOP-20B-105542 / 21B-105543',
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: 'Western Maharashtra Drug House',
      contactPerson: 'Pradeep Jadhav',
      phone: '0231-2659876 / +91 98221 44556',
      email: 'westerndrugs@gmail.com',
      address: 'Plot 45, E-Ward, Dabholkar Corner, Kolhapur',
      city: 'Kolhapur',
      gstin: '27CDEFG5566C3Z3',
      dlNumber: 'MH-KOP-20B-107789 / 21B-107790',
    },
  });

  console.log('✅ Created 3 local Kolhapur suppliers (Shahupuri, Laxmipuri, Dabholkar Corner).');

  // 4. Create Kolhapur Patients / Regular Khata Customers
  const cust1 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Suresh Shinde',
      phone: '+91 94231 11223',
      address: 'Plot 14, Tarabai Park, Kolhapur',
      doctorName: 'Dr. Rahul Patil (CPR Hospital)',
      creditBalance: 450.0,
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Pooja Deshmukh',
      phone: '+91 98224 44556',
      address: 'B-Wing, Shahu Park, Nagala Park, Kolhapur',
      doctorName: 'Dr. Sunita Kulkarni',
      creditBalance: 0.0,
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Ananda Kamble',
      phone: '+91 97650 77889',
      address: 'Lane 5, Rajarampuri, Kolhapur',
      doctorName: 'Dr. Sandeep Jadhav',
      creditBalance: 1250.0,
    },
  });

  console.log('✅ Created sample local customers with Khata credit balance.');

  // 5. Seed Real Indian Medicines with Batches
  const medicinesData = [
    {
      name: 'Dolo 650mg Tablet',
      genericName: 'Paracetamol (650mg)',
      brand: 'Micro Labs Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '15 Tablets/Strip',
      unitsPerPack: 15,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901117001015',
      minStockLevel: 25,
      rackLocation: 'Rack A-1 (Shelf 1)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'DL24089',
          expiryDate: new Date('2027-05-31'),
          mrp: 34.5,
          purchaseRate: 24.0,
          saleRate: 33.0,
          quantity: 140,
          initialQuantity: 200,
          supplierId: supplier1.id,
        },
        {
          batchNumber: 'DL23881',
          expiryDate: new Date('2026-11-30'), // Near Expiry!
          mrp: 32.0,
          purchaseRate: 22.0,
          saleRate: 30.0,
          quantity: 20,
          initialQuantity: 100,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Augmentin 625 Duo Tablet',
      genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      brand: 'GlaxoSmithKline Pharmaceuticals Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '10 Tablets/Strip',
      unitsPerPack: 10,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H1',
      barcode: '8901043003214',
      minStockLevel: 15,
      rackLocation: 'Rack B-2 (Antibiotics)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'AG7912',
          expiryDate: new Date('2027-03-31'),
          mrp: 204.5,
          purchaseRate: 162.0,
          saleRate: 195.0,
          quantity: 45,
          initialQuantity: 60,
          supplierId: supplier2.id,
        },
      ],
    },
    {
      name: 'Azithral 500mg Tablet',
      genericName: 'Azithromycin (500mg)',
      brand: 'Alembic Pharmaceuticals Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '5 Tablets/Strip',
      unitsPerPack: 5,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H1',
      barcode: '8901088012019',
      minStockLevel: 20,
      rackLocation: 'Rack B-3 (Antibiotics)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'AZ24190',
          expiryDate: new Date('2027-01-31'),
          mrp: 121.0,
          purchaseRate: 92.0,
          saleRate: 115.0,
          quantity: 65,
          initialQuantity: 100,
          supplierId: supplier2.id,
        },
      ],
    },
    {
      name: 'Pan 40mg Tablet',
      genericName: 'Pantoprazole (40mg)',
      brand: 'Alkem Laboratories Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '15 Tablets/Strip',
      unitsPerPack: 15,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H',
      barcode: '8901117034013',
      minStockLevel: 20,
      rackLocation: 'Rack A-2 (Antacids)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'PN5542',
          expiryDate: new Date('2027-08-31'),
          mrp: 155.0,
          purchaseRate: 118.0,
          saleRate: 145.0,
          quantity: 85,
          initialQuantity: 120,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Pantocid DSR Capsule',
      genericName: 'Pantoprazole (40mg) + Domperidone (30mg SR)',
      brand: 'Sun Pharmaceutical Industries Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'CAPSULE',
      packaging: '10 Capsules/Strip',
      unitsPerPack: 10,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H',
      barcode: '8901088045123',
      minStockLevel: 25,
      rackLocation: 'Rack A-2 (Antacids)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'PT8831',
          expiryDate: new Date('2027-09-30'),
          mrp: 210.0,
          purchaseRate: 160.0,
          saleRate: 198.0,
          quantity: 90,
          initialQuantity: 150,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Glycomet GP 2 Tablet',
      genericName: 'Metformin (500mg) + Glimepiride (2mg)',
      brand: 'USV Pvt Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '15 Tablets/Strip',
      unitsPerPack: 15,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H',
      barcode: '8901234056789',
      minStockLevel: 20,
      rackLocation: 'Rack C-1 (Diabetic)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'GL9012',
          expiryDate: new Date('2027-06-30'),
          mrp: 168.0,
          purchaseRate: 128.0,
          saleRate: 158.0,
          quantity: 75,
          initialQuantity: 100,
          supplierId: supplier3.id,
        },
      ],
    },
    {
      name: 'Telma 40mg Tablet',
      genericName: 'Telmisartan (40mg)',
      brand: 'Glenmark Pharmaceuticals Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '30 Tablets/Strip',
      unitsPerPack: 30,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H',
      barcode: '8901043009988',
      minStockLevel: 15,
      rackLocation: 'Rack C-2 (Cardiac/BP)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'TL4431',
          expiryDate: new Date('2027-10-31'),
          mrp: 220.0,
          purchaseRate: 168.0,
          saleRate: 205.0,
          quantity: 50,
          initialQuantity: 80,
          supplierId: supplier3.id,
        },
      ],
    },
    {
      name: 'Montair LC Tablet',
      genericName: 'Montelukast (10mg) + Levocetirizine (5mg)',
      brand: 'Cipla Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '10 Tablets/Strip',
      unitsPerPack: 10,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H',
      barcode: '8901117012345',
      minStockLevel: 20,
      rackLocation: 'Rack A-4 (Anti-allergic)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'MT8891',
          expiryDate: new Date('2027-04-30'),
          mrp: 215.0,
          purchaseRate: 165.0,
          saleRate: 200.0,
          quantity: 80,
          initialQuantity: 120,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Shelcal 500mg Tablet',
      genericName: 'Calcium (500mg) + Vitamin D3 (250 IU)',
      brand: 'Torrent Pharmaceuticals Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '15 Tablets/Strip',
      unitsPerPack: 15,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901088099881',
      minStockLevel: 30,
      rackLocation: 'Rack D-1 (Vitamins/Calcium)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'SH3312',
          expiryDate: new Date('2027-08-31'),
          mrp: 132.0,
          purchaseRate: 98.0,
          saleRate: 125.0,
          quantity: 110,
          initialQuantity: 150,
          supplierId: supplier2.id,
        },
      ],
    },
    {
      name: 'Becosules Z Capsules',
      genericName: 'B-Complex Forte with Vitamin C and Zinc',
      brand: 'Pfizer Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'CAPSULE',
      packaging: '20 Capsules/Strip',
      unitsPerPack: 20,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901043004455',
      minStockLevel: 25,
      rackLocation: 'Rack D-1 (Vitamins)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'BC9902',
          expiryDate: new Date('2027-05-31'),
          mrp: 52.0,
          purchaseRate: 38.0,
          saleRate: 49.0,
          quantity: 95,
          initialQuantity: 120,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Liv.52 DS Tablet',
      genericName: 'Himsra + Kasani Ayurvedic Liver Formulation',
      brand: 'Himalaya Wellness Company',
      category: 'AYURVEDIC',
      dosageForm: 'TABLET',
      packaging: '60 Tablets/Bottle',
      unitsPerPack: 60,
      hsnCode: '3004',
      gstRate: 5.0,
      scheduleType: 'GENERAL',
      barcode: '8901138831011',
      minStockLevel: 15,
      rackLocation: 'Rack E-1 (Ayurvedic Section)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'LV9912',
          expiryDate: new Date('2028-02-28'),
          mrp: 190.0,
          purchaseRate: 145.0,
          saleRate: 180.0,
          quantity: 40,
          initialQuantity: 50,
          supplierId: supplier3.id,
        },
      ],
    },
    {
      name: 'Combiflam Tablet',
      genericName: 'Ibuprofen (400mg) + Paracetamol (325mg)',
      brand: 'Sanofi India Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '20 Tablets/Strip',
      unitsPerPack: 20,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901088011223',
      minStockLevel: 30,
      rackLocation: 'Rack A-1 (Analgesics)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'CB4501',
          expiryDate: new Date('2027-04-30'),
          mrp: 45.0,
          purchaseRate: 32.0,
          saleRate: 42.0,
          quantity: 130,
          initialQuantity: 180,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Benadryl Cough Formula Syrup',
      genericName: 'Diphenhydramine HCl + Ammonium Chloride + Sodium Citrate',
      brand: 'Johnson & Johnson Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'SYRUP',
      packaging: '100ml Bottle',
      unitsPerPack: 1,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901043019876',
      minStockLevel: 15,
      rackLocation: 'Rack F-1 (Syrups & Liquids)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'BN2041',
          expiryDate: new Date('2027-02-28'),
          mrp: 135.0,
          purchaseRate: 102.0,
          saleRate: 128.0,
          quantity: 35,
          initialQuantity: 50,
          supplierId: supplier2.id,
        },
      ],
    },
    {
      name: 'Betadine 10% Ointment 20g',
      genericName: 'Povidone Iodine (10% w/w)',
      brand: 'Win-Medicare Pvt Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'OINTMENT',
      packaging: '20g Tube',
      unitsPerPack: 1,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901117088990',
      minStockLevel: 20,
      rackLocation: 'Rack D-2 (Ointments & Topicals)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'BT7710',
          expiryDate: new Date('2027-06-30'),
          mrp: 115.0,
          purchaseRate: 88.0,
          saleRate: 108.0,
          quantity: 45,
          initialQuantity: 60,
          supplierId: supplier2.id,
        },
      ],
    },
    {
      name: 'Volini Pain Relief Gel 30g',
      genericName: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol',
      brand: 'Sun Pharmaceutical Industries Ltd',
      category: 'OTC',
      dosageForm: 'OINTMENT',
      packaging: '30g Tube',
      unitsPerPack: 1,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'GENERAL',
      barcode: '8901088055667',
      minStockLevel: 25,
      rackLocation: 'Rack D-3 (Pain Relief)',
      prescriptionRequired: false,
      batches: [
        {
          batchNumber: 'VL4011',
          expiryDate: new Date('2027-11-30'),
          mrp: 125.0,
          purchaseRate: 95.0,
          saleRate: 118.0,
          quantity: 55,
          initialQuantity: 80,
          supplierId: supplier1.id,
        },
      ],
    },
    {
      name: 'Alprax 0.5mg Tablet',
      genericName: 'Alprazolam (0.5mg)',
      brand: 'Torrent Pharmaceuticals Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '15 Tablets/Strip',
      unitsPerPack: 15,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H1',
      barcode: '8901088033221',
      minStockLevel: 10,
      rackLocation: 'Locked Drug Safe (Schedule H1)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'AL1092',
          expiryDate: new Date('2026-11-30'), // Near Expiry Alert!
          mrp: 62.0,
          purchaseRate: 45.0,
          saleRate: 58.0,
          quantity: 14,
          initialQuantity: 30,
          supplierId: supplier2.id,
        },
      ],
    },
    {
      name: 'Ciplox 500mg Tablet',
      genericName: 'Ciprofloxacin (500mg)',
      brand: 'Cipla Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '10 Tablets/Strip',
      unitsPerPack: 10,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H1',
      barcode: '8901117044332',
      minStockLevel: 20,
      rackLocation: 'Rack B-1 (Antibiotics)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'CP9941',
          expiryDate: new Date('2027-05-31'),
          mrp: 48.0,
          purchaseRate: 35.0,
          saleRate: 45.0,
          quantity: 70,
          initialQuantity: 100,
          supplierId: supplier3.id,
        },
      ],
    },
    {
      name: 'Amlong 5mg Tablet',
      genericName: 'Amlodipine (5mg)',
      brand: 'Micro Labs Ltd',
      category: 'ALLOPATHY',
      dosageForm: 'TABLET',
      packaging: '15 Tablets/Strip',
      unitsPerPack: 15,
      hsnCode: '3004',
      gstRate: 12.0,
      scheduleType: 'SCHEDULE_H',
      barcode: '8901117077665',
      minStockLevel: 20,
      rackLocation: 'Rack C-2 (Cardiac/BP)',
      prescriptionRequired: true,
      batches: [
        {
          batchNumber: 'AM3321',
          expiryDate: new Date('2027-08-31'),
          mrp: 96.0,
          purchaseRate: 72.0,
          saleRate: 90.0,
          quantity: 60,
          initialQuantity: 90,
          supplierId: supplier1.id,
        },
      ],
    },
  ];

  for (const medData of medicinesData) {
    const { batches, ...info } = medData;
    const medicine = await prisma.medicine.create({
      data: {
        tenantId: tenant.id,
        ...info,
      },
    });

    for (const batch of batches) {
      await prisma.batch.create({
        data: {
          tenantId: tenant.id,
          medicineId: medicine.id,
          ...batch,
        },
      });
    }
  }

  console.log(`✅ Seeded ${medicinesData.length} medicines with full batch, rack, and pricing data.`);

  // 6. Seed a sample Schedule H1 entry (to demonstrate FDA compliance)
  await prisma.scheduleH1Log.create({
    data: {
      tenantId: tenant.id,
      medicineName: 'Augmentin 625 Duo Tablet',
      batchNumber: 'AG7912',
      quantity: 1,
      patientName: 'Suresh Shinde',
      patientAddress: 'Tarabai Park, Kolhapur',
      patientPhone: '+91 94231 11223',
      doctorName: 'Dr. Rahul Patil, M.D.',
      doctorAddress: 'CPR Hospital Road, Kolhapur',
      doctorRegNo: 'MMC/2012/04/1042',
      invoiceNumber: 'INV-2026-0001',
    },
  });

  console.log('✅ Seeded sample Schedule H1 compliance entry.');

  // 7. Seed sample recent Sale Invoice
  const sampleSale = await prisma.saleInvoice.create({
    data: {
      tenantId: tenant.id,
      invoiceNumber: 'INV-2026-0001',
      customerId: cust1.id,
      customerName: 'Suresh Shinde',
      customerPhone: '+91 94231 11223',
      doctorName: 'Dr. Rahul Patil, M.D.',
      doctorRegNo: 'MMC/2012/04/1042',
      subtotal: 228.0,
      discountAmount: 10.0,
      cgstAmount: 13.08,
      sgstAmount: 13.08,
      totalAmount: 244.16,
      paymentMode: 'UPI',
      paymentStatus: 'PAID',
      notes: 'Paid via PhonePe / GPay QR scan at counter',
    },
  });

  console.log(`✅ Seeded initial invoice: ${sampleSale.invoiceNumber}`);
  console.log('🎉 Kolhapur PharmaStock database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
