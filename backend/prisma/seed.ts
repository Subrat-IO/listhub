import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ListingStatus, PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

const CATEGORIES: { name: string; slug: string; description: string; sortOrder: number }[] = [
  { name: "Cars", slug: "cars", description: "Cars for sale", sortOrder: 1 },
  { name: "Motorcycles", slug: "motorcycles", description: "Bikes and scooters", sortOrder: 2 },
  { name: "Mobile Phones", slug: "mobile-phones", description: "Phones and accessories", sortOrder: 3 },
  { name: "For Sale: Houses & Apartments", slug: "houses-for-sale", description: "Homes for sale", sortOrder: 4 },
  { name: "For Rent: Houses & Apartments", slug: "houses-for-rent", description: "Homes for rent", sortOrder: 5 },
  { name: "Electronics", slug: "electronics", description: "Gadgets and appliances", sortOrder: 6 },
  { name: "Furniture", slug: "furniture", description: "Home furniture", sortOrder: 7 },
  { name: "Fashion", slug: "fashion", description: "Clothing and accessories", sortOrder: 8 },
  { name: "Pets", slug: "pets", description: "Pets and supplies", sortOrder: 9 },
  { name: "Books, Sports & Hobbies", slug: "books-hobbies", description: "Books, sports and hobbies", sortOrder: 10 },
  { name: "Services", slug: "services", description: "Local services", sortOrder: 11 },
  { name: "Commercial Vehicles", slug: "commercial-vehicles", description: "Vans and trucks", sortOrder: 12 },
  { name: "Jobs", slug: "jobs", description: "Job listings", sortOrder: 13 },
];

const DEMO = [
  { slug: "mobile-phones", title: "Apple iPhone 13 (128 GB)", price: "45000", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=900&q=80", fee: "Screen guard" },
  { slug: "cars", title: "Hyundai Verna 1.6 SX (Petrol), 2019", price: "725000", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80" },
  { slug: "motorcycles", title: "Royal Enfield Classic 350 - 2021", price: "185000", location: "Bengaluru, KA", days: 1, image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=900&q=80" },
  { slug: "furniture", title: "3 Seater Fabric Sofa (Excellent)", price: "22000", location: "Bengaluru, KA", days: 4, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80" },
  { slug: "houses-for-sale", title: "Residential Plot - 1200 sq.ft", price: "3600000", location: "Whitefield, Bengaluru", days: 5, image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80" },
  { slug: "fashion", title: "Men's Check Shirt (Cotton, L)", price: "699", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80" },
  { slug: "electronics", title: "Canon EOS 200D II with 18-55mm", price: "38000", location: "Bengaluru, KA", days: 1, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80" },
  { slug: "fashion", title: "Prescription Eyeglasses (Full Rim)", price: "1499", location: "Bengaluru, KA", days: 6, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80" },
  { slug: "electronics", title: "Stainless Steel Cookware Set (5 Pcs)", price: "2999", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80" },
  { slug: "electronics", title: "JBL Flip 6 Bluetooth Speaker", price: "4499", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80" },
  { slug: "electronics", title: "Lenovo IdeaPad 5 (Ryzen 5, 16GB)", price: "52000", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80" },
  { slug: "furniture", title: "Wall Shelves Set (3 Pcs) - Wooden", price: "1299", location: "Bengaluru, KA", days: 5, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80" },
  { slug: "houses-for-sale", title: "3 BHK House for Sale - 1800 sq.ft", price: "11500000", location: "Sadepur, Bengaluru", days: 6, image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80" },
  { slug: "electronics", title: "Noise ColorFit Pro 4 Smartwatch", price: "5999", location: "Bengaluru, KA", days: 2, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80" },
  { slug: "furniture", title: "Dining Table with 4 Chairs (Wooden)", price: "18000", location: "Bengaluru, KA", days: 4, image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80" },
  { slug: "furniture", title: "Area Rug (5 x 7 ft, Grey)", price: "2499", location: "Bengaluru, KA", days: 3, image: "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=900&q=80" },
];

async function main() {
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where: { name }, create: { name }, update: {} });
  }

  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder: category.sortOrder },
      create: category,
    });
    categoryIds.set(category.slug, row.id);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@listhub.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123456!";
  const userRole = await prisma.role.findUniqueOrThrow({ where: { name: "USER" } });
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        profile: { create: { displayName: "ListHub Admin", location: "Bengaluru" } },
        userRoles: { createMany: { data: [{ roleId: adminRole.id }, { roleId: userRole.id }] } },
      },
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  const sellerEmail = "seller@listhub.local";
  let seller = await prisma.user.findUnique({ where: { email: sellerEmail } });
  if (!seller) {
    seller = await prisma.user.create({
      data: {
        email: sellerEmail,
        passwordHash: await bcrypt.hash("SellerDemo123!", 12),
        profile: { create: { displayName: "ListHub Seller", location: "Bengaluru, KA" } },
        userRoles: { create: { roleId: userRole.id } },
      },
    });
  }

  const already = await prisma.listing.count({ where: { sellerId: seller.id, title: DEMO[0]!.title } });
  if (already > 0) {
    console.log("Demo listings already present");
    return;
  }

  for (const item of DEMO) {
    const categoryId = categoryIds.get(item.slug);
    if (!categoryId) continue;
    await prisma.listing.create({
      data: {
        sellerId: seller.id,
        categoryId,
        title: item.title,
        description: `${item.title}. Seller sets the asking price. Extra charges, if any, are listed on the ad. Demo listing for ListHub.`,
        askingPrice: item.price,
        currency: "INR",
        location: item.location,
        status: ListingStatus.ACTIVE,
        featured: item.days <= 2,
        createdAt: new Date(Date.now() - item.days * 24 * 60 * 60 * 1000),
        images: { create: [{ url: item.image, sortOrder: 0 }] },
        fees: item.fee
          ? { create: [{ label: item.fee, amount: "499", currency: "INR" }] }
          : undefined,
        terms: {
          create: [{ content: "Buyer pays the listed asking price plus any disclosed extra charges.", sortOrder: 0 }],
        },
      },
    });
  }

  console.log(`Seeded ${DEMO.length} demo listings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
