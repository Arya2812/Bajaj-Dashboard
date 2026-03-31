// Cluster rule lookup
export const CLUSTER_RULES: Record<string, string> = {
  "ELC|N|CTR|NS|ELEC|TRN":  "Core Electrical Trade Outlet",
  "ELC|N|CTR|BS|ELEC|PUS":  "Electrician-led Counter Trade Outlet",
  "APL|N|AST|CB|WLK|AST":   "Appliance Assisted Retail",
  "APL|N|OPN|DDZ|WLK|DEM":  "Appliance Experience Outlet",
  "LGT|N|OPN|DDZ|WLK|SELF": "Lighting Experience Retail",
  "HEA|N|AST|CB|MIX|AST":   "Hybrid Growth Retailer",
  "HEA|N|OPN|MZL|MIX|AST":  "Large Hybrid Display Store",
  "CDE|N|EXP|MZL|PRM|DEM":  "Premium Consumer Durable Experience Store",
  "HWE|E|CTR|BS|ELEC|TRN":  "Hardware + Electrical Trade Outlet",
  "MGT|M|SHF|BS|MIX|PUS":   "Multi-category Mass Trade Outlet",
  "ELC|L|AST|BRS|MIX|AST":  "Electrical + Lighting Assisted Retail",
  "APL|K|OPN|CB|WLK|AST":   "Kitchen Appliance Growth Outlet",
  "CDE|A|EXP|DDZ|PRM|DEM":  "Premium Electronics + Appliance Studio",
};

export const PRIMARY_FAMILY_LABELS: Record<string, string> = {
  ELC: "Core Electricals",
  APL: "Appliances",
  LGT: "Lighting",
  HEA: "Electrical + Appliances Hybrid",
  CDE: "Consumer Durable / Electronics",
  HWE: "Hardware + Electrical",
  MGT: "Multi-category Trade",
};

export const SECONDARY_FAMILY_LABELS: Record<string, string> = {
  N: "None",
  E: "Electricals",
  A: "Appliances",
  L: "Lighting",
  C: "Electronics",
  K: "Kitchen Solutions",
  M: "Mixed",
};

// FMR Score Band thresholds
export const SCORE_BANDS = [
  { min: 0.85, band: "S1", category: "Strategic+" },
  { min: 0.75, band: "S2", category: "Strategic" },
  { min: 0.68, band: "A1", category: "Active Target" },
  { min: 0.60, band: "A2", category: "Selective Target" },
  { min: 0.52, band: "B1", category: "Conditional" },
  { min: 0.45, band: "B2", category: "Watchlist" },
  { min: 0.00, band: "C",  category: "Do Not Pursue" },
];

// Band colors for UI
export const BAND_COLORS: Record<string, string> = {
  S1: "#0052A3",
  S2: "#2A7ADE",
  A1: "#22C55E",
  A2: "#84CC16",
  B1: "#F59E0B",
  B2: "#F97316",
  C:  "#EF4444",
};

export const UPGRADE_ORDER = [
  "Do Not Pursue","Watchlist","Conditional",
  "Selective Target","Active Target","Strategic","Strategic+",
];
