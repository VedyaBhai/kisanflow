export const CROPS = ["Tomato", "Onion", "Chilli", "Potato", "Banana", "Cotton", "Rice"];
export const LOCATIONS = ["Hyderabad", "Warangal", "Karimnagar", "Nalgonda", "Siddipet", "Khammam", "Sangareddy"];

export const FARMERS = [
  { id: "F01", name: "Ramesh Reddy", loc: "Warangal", crop: "Tomato", qty: 2000, grade: "A", ready: "Tomorrow", minPrice: 21 },
  { id: "F02", name: "Suresh Naik", loc: "Siddipet", crop: "Tomato", qty: 1500, grade: "A", ready: "Tomorrow", minPrice: 20 },
  { id: "F03", name: "Lakshmi Devi", loc: "Nalgonda", crop: "Tomato", qty: 3000, grade: "A", ready: "2 days", minPrice: 21 },
  { id: "F04", name: "Anitha Kumari", loc: "Hyderabad Rural", crop: "Tomato", qty: 1000, grade: "A", ready: "Tomorrow", minPrice: 22 },
  { id: "F05", name: "Mahesh Goud", loc: "Sangareddy", crop: "Tomato", qty: 2500, grade: "A", ready: "Tomorrow", minPrice: 21 },
  { id: "F06", name: "Ravi Kumar", loc: "Khammam", crop: "Chilli", qty: 900, grade: "A", ready: "3 days", minPrice: 60 },
  { id: "F07", name: "Kiran Chandra", loc: "Warangal", crop: "Onion", qty: 4200, grade: "B", ready: "5 days", minPrice: 14 },
  { id: "F08", name: "Srinivas Rao", loc: "Karimnagar", crop: "Rice", qty: 8000, grade: "A", ready: "12 days", minPrice: 19 },
  { id: "F09", name: "Padma Latha", loc: "Nalgonda", crop: "Chilli", qty: 650, grade: "A", ready: "4 days", minPrice: 58 },
  { id: "F10", name: "Rajesh Varma", loc: "Sangareddy", crop: "Cotton", qty: 3000, grade: "B", ready: "20 days", minPrice: 62 },
  { id: "F11", name: "Sunitha Bai", loc: "Siddipet", crop: "Potato", qty: 2200, grade: "A", ready: "6 days", minPrice: 12 },
  { id: "F12", name: "Nagaraju G", loc: "Khammam", crop: "Banana", qty: 1800, grade: "A", ready: "Tomorrow", minPrice: 9 },
  { id: "F13", name: "Vijaya Lakshmi", loc: "Hyderabad Rural", crop: "Onion", qty: 3100, grade: "A", ready: "3 days", minPrice: 15 },
  { id: "F14", name: "Prasad Rao", loc: "Warangal", crop: "Rice", qty: 6000, grade: "B", ready: "9 days", minPrice: 18 },
  { id: "F15", name: "Manjula Devi", loc: "Karimnagar", crop: "Tomato", qty: 1200, grade: "B", ready: "2 days", minPrice: 19 },
  { id: "F16", name: "Yadagiri Rao", loc: "Nalgonda", crop: "Potato", qty: 1700, grade: "A", ready: "4 days", minPrice: 12 },
  { id: "F17", name: "Sarojini K", loc: "Sangareddy", crop: "Chilli", qty: 500, grade: "A", ready: "5 days", minPrice: 59 },
  { id: "F18", name: "Balaraju N", loc: "Siddipet", crop: "Cotton", qty: 2600, grade: "A", ready: "18 days", minPrice: 63 },
  { id: "F19", name: "Shobha Rani", loc: "Khammam", crop: "Banana", qty: 1400, grade: "B", ready: "2 days", minPrice: 8 },
  { id: "F20", name: "Chandra Sekhar", loc: "Hyderabad Rural", crop: "Rice", qty: 5200, grade: "A", ready: "10 days", minPrice: 20 },
];

export const BUYERS = [
  { id: "B01", name: "Hyderabad Retail Buyer", type: "Retail Chain", loc: "Hyderabad" },
  { id: "B02", name: "Deccan FreshMart", type: "Retail Chain", loc: "Hyderabad" },
  { id: "B03", name: "Telangana AgriExports", type: "Exporter", loc: "Warangal" },
  { id: "B04", name: "SRK Wholesale Traders", type: "Wholesaler", loc: "Karimnagar" },
  { id: "B05", name: "Greenline Foods Pvt Ltd", type: "Processor", loc: "Hyderabad" },
  { id: "B06", name: "Nalgonda Mandi Aggregators", type: "Wholesaler", loc: "Nalgonda" },
  { id: "B07", name: "CottonWeave Mills", type: "Processor", loc: "Sangareddy" },
  { id: "B08", name: "Khammam Fresh Co-op", type: "Retail Chain", loc: "Khammam" },
  { id: "B09", name: "Metro Institutional Supply", type: "Institutional", loc: "Hyderabad" },
  { id: "B10", name: "Siddipet Rythu Bazaar", type: "Wholesaler", loc: "Siddipet" },
];

export const VEHICLES = [
  { id: "TRK-101", capacity: 10, used: 6, route: "Warangal → Hyderabad" },
  { id: "TRK-102", capacity: 8, used: 5, route: "Siddipet → Hyderabad" },
  { id: "TRK-103", capacity: 6, used: 2, route: "Nalgonda → Hyderabad" },
  { id: "TRK-104", capacity: 8, used: 4, route: "Sangareddy → Hyderabad" },
  { id: "TRK-105", capacity: 12, used: 9, route: "Karimnagar → Hyderabad" },
  { id: "TRK-106", capacity: 6, used: 6, route: "Khammam → Hyderabad" },
  { id: "TRK-107", capacity: 10, used: 3, route: "Hyderabad Rural → Hyderabad" },
  { id: "TRK-108", capacity: 8, used: 0, route: "Unassigned" },
  { id: "TRK-109", capacity: 6, used: 1, route: "Unassigned" },
  { id: "TRK-110", capacity: 10, used: 7, route: "Warangal → Hyderabad" },
];

export const DEMAND_HISTORY = {
  Tomato: [14200, 15800, 16500, 17200, 18900, 20100, 21400, 22000],
  Onion: [24000, 25500, 27000, 27800, 28600, 29400, 29900, 30000],
  Chilli: [5200, 5600, 5900, 6100, 6400, 6700, 6900, 7000],
};

export const DEMAND_MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct*"];

export const DEMAND_RADAR = [
  { crop: "Tomato", loc: "Hyderabad", demand: 22000, supply: 14000, price: 27, farmerLow: 23.5, farmerHigh: 25, confidence: 87 },
  { crop: "Onion", loc: "Hyderabad", demand: 30000, supply: 35000, price: 19, farmerLow: 15.5, farmerHigh: 16.5, confidence: 81 },
  { crop: "Chilli", loc: "Hyderabad", demand: 7000, supply: 11000, price: 64, farmerLow: 57, farmerHigh: 60, confidence: 79 },
  { crop: "Potato", loc: "Warangal", demand: 9800, supply: 7600, price: 17, farmerLow: 12.5, farmerHigh: 13.5, confidence: 74 },
  { crop: "Banana", loc: "Khammam", demand: 6100, supply: 6300, price: 12, farmerLow: 9, farmerHigh: 9.8, confidence: 70 },
];

export const VIRTUAL_LOTS = [
  {
    id: "VL-2026-014",
    crop: "Tomato",
    grade: "A",
    buyer: "Hyderabad Retail Buyer",
    required: 10000,
    farmers: [
      { name: "Farmer A · Warangal", qty: 2000 },
      { name: "Farmer B · Siddipet", qty: 1500 },
      { name: "Farmer C · Nalgonda", qty: 3000 },
      { name: "Farmer D · Hyderabad Rural", qty: 1000 },
      { name: "Farmer E · Sangareddy", qty: 2500 },
    ],
    buyerPrice: 27,
    farmerRealization: 24,
    consumerPrice: 31,
    status: "READY FOR LOGISTICS",
  },
  {
    id: "VL-2026-015",
    crop: "Chilli",
    grade: "A",
    buyer: "Telangana AgriExports",
    required: 2200,
    farmers: [
      { name: "Farmer F · Khammam", qty: 900 },
      { name: "Farmer G · Nalgonda", qty: 650 },
      { name: "Farmer H · Sangareddy", qty: 500 },
    ],
    buyerPrice: 64,
    farmerRealization: 58,
    consumerPrice: 72,
    status: "COLLECTING",
  },
  {
    id: "VL-2026-016",
    crop: "Onion",
    grade: "B",
    buyer: "SRK Wholesale Traders",
    required: 8000,
    farmers: [
      { name: "Farmer I · Warangal", qty: 4200 },
      { name: "Farmer J · Hyderabad Rural", qty: 3100 },
    ],
    buyerPrice: 19,
    farmerRealization: 15.8,
    consumerPrice: 23,
    status: "COLLECTING",
  },
];
// ============================================================
// KISANFLOW DEMO WORKFLOW DATA
// ============================================================

export const DEMO_BUYER_DEMAND = {
  buyer: "Vedya",
  crop: "Tomato",
  quantityKg: 5000,
  grade: "A",
  destination: "Hyderabad",
  requiredDate: "Tomorrow",
};

export const DEMO_CANDIDATE_FARMERS = [
  {
    id: "DF01",
    name: "Akshay",
    loc: "Warangal",
    crop: "Tomato",
    qty: 2000,
    grade: "A",
    ready: "Tomorrow",
    score: 96,
  },
  {
    id: "DF02",
    name: "Nikhil",
    loc: "Narketpalli",
    crop: "Tomato",
    qty: 1500,
    grade: "A",
    ready: "Tomorrow",
    score: 93,
  },
  {
    id: "DF03",
    name: "Akshaya",
    loc: "Nalgonda",
    crop: "Tomato",
    qty: 1500,
    grade: "A",
    ready: "Tomorrow",
    score: 91,
  },
];

export const WHATSAPP_MESSAGE =
  "నమస్కారం! KISANFLOW ద్వారా హైదరాబాద్‌కు Grade A టమాటా అవసరం ఉంది. మీకు అందుబాటులో ఉన్న పరిమాణాన్ని తెలియజేయండి.\n\n" +
  "Hello! KISANFLOW has a buyer requirement for Grade A Tomato to Hyderabad. Please confirm your available quantity.";

export const TELUGU_VOICE_TEXT =
  "నమస్కారం. కిసాన్ ఫ్లో ద్వారా హైదరాబాద్‌కు గ్రేడ్ ఏ టమాటా అవసరం ఉంది. మీకు అందుబాటులో ఉన్న పరిమాణాన్ని దయచేసి తెలియజేయండి.";

export const DEMO_FARMER_RESPONSES = {
  Akshay: "Yes, I can supply 2000 kg.",
  Nikhil: "Yes, I can supply 1500 kg.",
  Akshaya: "Yes, I can supply 1500 kg.",
};

export const DEMO_LOT_ID = "VL-DEMO-5000";

export const DEMO_LOGISTICS = {
  partner: "Ruthvika",
  vehicle: "TRK-101",
  loadKg: 5000,
  destination: "Hyderabad",
};
export const BUYER_DEMANDS = [
  {
    id: "BD001",
    buyer: "Vedya",
    crop: "Tomato",
    quantity: 5000,
    quantityKg: 5000,
    grade: "A",
    destination: "Hyderabad",
    requiredDate: "Tomorrow",
    status: "Open",
  },
];
