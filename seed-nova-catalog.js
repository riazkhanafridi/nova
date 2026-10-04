import dotenv from "dotenv";

dotenv.config();

const API_BASE = process.env.API_BASE || "http://localhost:8000/api/v1";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nova.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234";

const brands = [
  { name: "Apple", description: "Premium mobile technology and accessories" },
  { name: "Samsung", description: "Reliable mobile and smart tech essentials" },
  { name: "Anker", description: "Fast charging and audio accessories" },
  { name: "UGREEN", description: "Power hubs, chargers and workstation gear" },
  { name: "Logitech", description: "Performance hardware for gaming and computing" },
  { name: "BASEUS", description: "Everyday carry, mobile and protection accessories" },
];

const categories = [
  { name: "Mobile Accessories", description: "Phone protection, mounts, chargers and audio accessories", sortOrder: 1 },
  { name: "Computer Accessories", description: "Premium keyboard, dock, hub and workspace accessories", sortOrder: 2 },
  { name: "Networking", description: "Cables, adapters and connectivity essentials", sortOrder: 3 },
  { name: "Headphones", description: "Wireless and wired audio products for every lifestyle", sortOrder: 4 },
  { name: "Gaming Gear", description: "Gaming essentials crafted for precision and speed", sortOrder: 5 },
  { name: "Phone Cases", description: "Shockproof and stylish phone protection", parentId: 1, sortOrder: 1 },
  { name: "Chargers & Cables", description: "Fast-charge devices with durable cables", parentId: 1, sortOrder: 2 },
  { name: "Laptop Accessories", description: "Upgrade your setup with premium laptop essentials", parentId: 2, sortOrder: 1 },
  { name: "Wireless Audio", description: "Noise-canceling and wireless sound gear", parentId: 4, sortOrder: 1 },
  { name: "Wi-Fi Routers", description: "High-speed internet and home networking devices", parentId: 3, sortOrder: 1 },
  { name: "Gaming Mice", description: "Precision mice optimized for performance", parentId: 5, sortOrder: 1 },
];

const services = [
  {
    name: "Computer Repair",
    description: "Full diagnostics and performance repair for desktops and laptops",
    shortDescription: "Fix slow, damaged or outdated computers",
    price: 120,
    duration: "1-3 hours",
    turnaround: "Same day",
    icon: "laptop",
    sortOrder: 1,
  },
  {
    name: "Laptop Repair",
    description: "Battery, keyboard, board and display repairs for laptops",
    shortDescription: "Expert laptop repair and diagnostics",
    price: 150,
    duration: "2-4 hours",
    turnaround: "24 hours",
    icon: "monitor",
    sortOrder: 2,
  },
  {
    name: "Data Recovery",
    description: "Recover lost files and repair storage devices",
    shortDescription: "Safe recovery for HDD and SSD drives",
    price: 180,
    duration: "Same day",
    turnaround: "1-2 days",
    icon: "hard-drive",
    sortOrder: 3,
  },
  {
    name: "Office Setup",
    description: "Complete workstation and business tech setup",
    shortDescription: "Set up devices and network for offices",
    price: 220,
    duration: "3-5 hours",
    turnaround: "Next business day",
    icon: "briefcase",
    sortOrder: 4,
  },
  {
    name: "Screen Repair",
    description: "Fast mobile and tablet display replacement service",
    shortDescription: "Cracked screens repaired professionally",
    price: 95,
    duration: "1-2 hours",
    turnaround: "Same day",
    icon: "smartphone",
    sortOrder: 5,
  },
];

const products = [
  {
    name: "Pro Wireless Earbuds",
    description: "Premium wireless earbuds with active noise cancellation, deep bass and all-day comfort.",
    shortDescription: "Premium earbuds for calls, music and workouts.",
    sku: "NOVA-EP-001",
    price: 299,
    comparePrice: 399,
    quantity: 45,
    categoryId: 4,
    brandId: 3,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Battery: "30 hours", Connectivity: "Bluetooth 5.3", Weight: "45g" },
    tags: ["wireless", "earbuds", "audio", "premium"],
  },
  {
    name: "140W GaN Wall Charger",
    description: "Compact 140W GaN charger delivering ultra-fast power to phone, laptop and tablet devices.",
    shortDescription: "Fast, compact GaN wall charger.",
    sku: "NOVA-CH-002",
    price: 199,
    comparePrice: 249,
    quantity: 60,
    categoryId: 1,
    brandId: 4,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Output: "140W", Ports: "3 ports", Type: "GaN" },
    tags: ["charger", "gan", "fast-charge", "accessories"],
  },
  {
    name: "Mechanical Keyboard TKL",
    description: "Compact tenkeyless gaming keyboard with mechanical switches and custom lighting.",
    shortDescription: "Compact keyboard built for gaming and productivity.",
    sku: "NOVA-KB-003",
    price: 599,
    comparePrice: 699,
    quantity: 32,
    categoryId: 2,
    brandId: 5,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Layout: "TKL", Switches: "Mechanical", Lighting: "RGB" },
    tags: ["keyboard", "computer", "gaming", "logitech"],
  },
  {
    name: "Magnetic Car Mount",
    description: "Strong magnetic phone mount for easy navigation and hands-free calls in the car.",
    shortDescription: "Secure car mount for phone navigation.",
    sku: "NOVA-CM-004",
    price: 79,
    comparePrice: 99,
    quantity: 80,
    categoryId: 1,
    brandId: 6,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Grip: "Magnetic", Usage: "Vehicle", Material: "ABS" },
    tags: ["car-mount", "mobile", "travel", "accessory"],
  },
  {
    name: "Screen Protector Set",
    description: "Scratch-resistant tempered glass protector set for modern smartphones.",
    shortDescription: "Tempered glass screen protection pack.",
    sku: "NOVA-SP-005",
    price: 49,
    comparePrice: 69,
    quantity: 90,
    categoryId: 1,
    brandId: 6,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Material: "Tempered glass", Coverage: "Full front", Pack: "2 pieces" },
    tags: ["screen-protector", "mobile", "glass", "accessories"],
  },
  {
    name: "7-in-1 USB-C Hub",
    description: "Compact USB-C hub making your workspace faster and more connected.",
    shortDescription: "Expand ports with USB-C connectivity.",
    sku: "NOVA-HUB-006",
    price: 179,
    comparePrice: 219,
    quantity: 40,
    categoryId: 2,
    brandId: 4,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Ports: "7 total", Interface: "USB-C", Compatibility: "MacBook and Windows" },
    tags: ["hub", "usb-c", "workspace", "accessory"],
  },
  {
    name: "3-in-1 Wireless Charger",
    description: "Charge your watch, phone and earbuds simultaneously with elegant wireless convenience.",
    shortDescription: "Multi-device charging stand.",
    sku: "NOVA-WC-007",
    price: 229,
    comparePrice: 289,
    quantity: 35,
    categoryId: 1,
    brandId: 3,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Charging: "3 devices", Power: "15W", Compatibility: "Qi-enabled" },
    tags: ["wireless", "charger", "desk", "mobile"],
  },
  {
    name: "Gaming Mouse Pro",
    description: "Ergonomic gaming mouse with customizable buttons and ultra-fast response.",
    shortDescription: "Precision gaming mouse with RGB lighting.",
    sku: "NOVA-GM-008",
    price: 249,
    comparePrice: 299,
    quantity: 26,
    categoryId: 5,
    brandId: 5,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Buttons: "8 programmable", Sensor: "High precision", RGB: "Customizable" },
    tags: ["gaming", "mouse", "logitech", "performance"],
  },
  {
    name: "Wi-Fi 6 Router",
    description: "High-speed Wi-Fi 6 router for homes, workspaces and streaming setups.",
    shortDescription: "Next-gen Wi-Fi for multiple devices.",
    sku: "NOVA-RT-009",
    price: 499,
    comparePrice: 599,
    quantity: 22,
    categoryId: 3,
    brandId: 4,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Standard: "Wi-Fi 6", Coverage: "Up to 3000 sq ft", Speed: "AX5400" },
    tags: ["networking", "wifi", "router", "smart-home"],
  },
  {
    name: "USB-C to HDMI Cable",
    description: "Reliable cable for dual-screen productivity, streaming and presentations.",
    shortDescription: "Connect USB-C devices to HDMI displays.",
    sku: "NOVA-HD-010",
    price: 89,
    comparePrice: 119,
    quantity: 55,
    categoryId: 3,
    brandId: 4,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    status: "ACTIVE",
    condition: "NEW",
    specifications: { Length: "2m", Ports: "USB-C to HDMI", Support: "4K" },
    tags: ["hdmi", "cable", "networking", "display"],
  },
];

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const text = await response.text();
  let payload;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw new Error(`${path} failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function loginAdmin() {
  const result = await apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  const token = result?.data?.accessToken;
  if (!token) {
    throw new Error("Login response did not include accessToken");
  }

  return token;
}

async function createBrand(token, item) {
  return apiFetch("/brands", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
}

async function createCategory(token, item) {
  return apiFetch("/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
}

async function createService(token, item) {
  return apiFetch("/services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });
}

async function createProduct(token, item) {
  const form = new FormData();

  Object.entries(item).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "object" && !(value instanceof Blob)) {
      form.append(key, JSON.stringify(value));
      return;
    }
    form.append(key, String(value));
  });

  return apiFetch("/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
}

async function seedCatalog() {
  const token = await loginAdmin();
  console.log("✅ Admin login successful");

  const createdBrands = [];
  for (const brand of brands) {
    const result = await createBrand(token, brand);
    createdBrands.push(result?.data ?? result);
    console.log(`Brand created: ${brand.name}`);
  }

  const createdCategories = [];
  for (const category of categories) {
    const result = await createCategory(token, category);
    createdCategories.push(result?.data ?? result);
    console.log(`Category created: ${category.name}`);
  }

  for (const service of services) {
    const result = await createService(token, service);
    console.log(`Service created: ${service.name}`);
    console.log(result);
  }

  for (const product of products) {
    const result = await createProduct(token, product);
    console.log(`Product created: ${product.name}`);
    console.log(result);
  }

  console.log("\nCatalog seed completed successfully.");
  console.log(`Brands: ${createdBrands.length}`);
  console.log(`Categories: ${createdCategories.length}`);
  console.log(`Services: ${services.length}`);
  console.log(`Products: ${products.length}`);
}

seedCatalog().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
