import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData() {
  // Delete in dependency order: children first, then parents
  const deletionOrder = [
    "ExpenseByCategory",
    "Sales",
    "Purchases",
    "SalesSummary",
    "PurchaseSummary",
    "Expenses",
    "Users",
    "Products",
    "ExpenseSummary",
  ];

  for (const modelName of deletionOrder) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (!model) continue;
    await model.deleteMany({});
    console.log(`Cleared data from ${modelName}`);
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "products.json",
    "expenseSummary.json",
    "sales.json",
    "salesSummary.json",
    "purchases.json",
    "purchaseSummary.json",
    "users.json",
    "expenses.json",
    "expenseByCategory.json",
  ];

  await deleteAllData();

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    let jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    // Replace product names with realistic supermarket items for dev
    if (fileName === "products.json") {
      const realisticNames = [
        "Royal Aroma Rice 5kg",
        "Fortune Vegetable Oil 1L",
        "Peak Milk 1L",
        "Kings Bread Loaf",
        "Golden Penny Spaghetti",
        "Sardine in Oil (Tin)",
        "Blue Band Margarine 250g",
        "Indomie Instant Noodles",
        "Fresh Tomatoes Pack",
        "Nestlé Milo 400g",
        "Coca-Cola 1.5L",
        "Bottled Water 1.5L",
        "Yoghurt Drink 500ml",
        "Weetabix Cereal",
        "Cornflakes 500g",
        "Sugar 1kg",
        "Salt 1kg",
        "Onions 1kg",
        "Tissue Roll (4 pack)",
        "Detergent Powder",
        "Hand Wash 500ml",
        "Toothpaste 140g",
        "Toothbrush (2 pack)",
        "Shampoo 400ml",
        "Bar Soap 120g",
        "Body Lotion 400ml",
        "Baby Diapers (Small Pack)",
        "Rice 25kg",
        "Beans 5kg",
        "Chicken Wings (Frozen)"
      ];
      jsonData = jsonData.map((item: any, idx: number) => ({
        ...item,
        name: realisticNames[idx % realisticNames.length],
      }));
    }

    for (const data of jsonData) {
      await model.create({
        data,
      });
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });